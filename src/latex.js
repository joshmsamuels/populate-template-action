import {
  createWriteStream, existsSync, mkdirSync, writeFileSync,
} from 'fs';
import { isArray, isString } from 'lodash-es';
import latex from 'node-latex';
import npmlog from 'npmlog';
import { dirname, join, resolve } from 'path';
import GetFile from './io.js';

export const downloadFilesToDirectory = async (fileUrls, dir) => {
  // Does not try to download files if the urls are falsy
  if (!fileUrls) {
    return;
  }

  if (!isArray(fileUrls)) {
    npmlog.error('fileUrls must be an array but was', fileUrls);
    throw Error('Parameter fileUrls is invalid');
  }

  if (!fileUrls.every((fileUrl) => isString(fileUrl))) {
    npmlog.error('All elements of fileUrls must be a string but was', fileUrls);
    throw Error('One or more URLs are invalid');
  }

  if (!isString(dir)) {
    npmlog.error('dir must be a string but was', dir);
    throw Error('Invalid Directory');
  }

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  await Promise.all(fileUrls.map(async (fileUrl) => {
    let fileContents = await GetFile(fileUrl);

    if (!isString(fileContents)) {
      // We can only write strings to files
      fileContents = JSON.stringify(fileContents);
    }

    const filename = fileUrl.substring(fileUrl.lastIndexOf('/'));

    writeFileSync(join(dir, filename), fileContents);
  }));
};

const WriteLatexFile = async (latexFile, fontAssetUrls, otherAssetUrls, outputFilePath) => {
  const fontsPath = join(dirname(outputFilePath), 'fonts');
  const otherAssetsPath = join(dirname(outputFilePath), 'otherAssets');

  await Promise.all([
    downloadFilesToDirectory(fontAssetUrls, fontsPath),
    downloadFilesToDirectory(otherAssetUrls, otherAssetsPath),
  ]);

  const outputFileStream = createWriteStream(outputFilePath);
  latex(
    latexFile,
    {
      inputs: resolve(otherAssetsPath),
      fonts: resolve(fontsPath),
      cmd: 'xetex',
    },
  ).pipe(outputFileStream);
};

export default WriteLatexFile;
