import axios from 'axios';
import npmlog from 'npmlog';
import { isArray, isString } from 'lodash-es';
import { join } from 'path';
import { track } from 'temp';
import { writeFileSync } from 'fs';

const { mkdirSync } = track(true);

const isHttpUrl = (fileLocation) => {
  let url;

  try {
    url = new URL(fileLocation);
  } catch (error) {
    npmlog.error(`${fileLocation} is not a valid URL`, error);
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

const getFileByURL = async (url) => {
  const res = await axios.get(url);
  return res.data;
};

const GetFile = async (fileLocation) => {
  if (isHttpUrl(fileLocation)) {
    return getFileByURL(fileLocation);
  }

  // TODO: Support specifying local files
  throw Error(`${fileLocation} is not a valid URL`);
};

export const downloadTempFiles = async (assets) => {
  const tempDir = mkdirSync('populate-template-action');

  await Promise.all(assets.map(async ({ downloadDir, fileUrls }) => {
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

    if (!isString(downloadDir)) {
      npmlog.error('downloadDir must be a string but was', downloadDir);
      throw Error('Invalid download directory');
    }

    await Promise.all(fileUrls.map(async (fileUrl) => {
      let fileContents = await GetFile(fileUrl);

      if (!isString(fileContents)) {
        // We can only write strings to files
        fileContents = JSON.stringify(fileContents);
      }

      const filename = fileUrl.substring(fileUrl.lastIndexOf('/'));

      writeFileSync(join(tempDir, downloadDir, filename), fileContents);

      npmlog.info(`downloaded ${filename} to ${join(tempDir, downloadDir)}`);
    }));
  }));

  return tempDir;
};

export default GetFile;
