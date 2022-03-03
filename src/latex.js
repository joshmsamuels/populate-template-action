import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { track } from 'temp';
import { downloadFileByURL } from './io.js';

const { mkdir } = track(true);

/**
 * Generates a PDF file from the supplied latex inputs using xelatex.
 * @param {object[]} filesToDownload is the array of objects that specifies
 * where all the files should be downloaded.
 * @param {string} filesToDownload.dir is the directory the files should be downloaded to.
 * The directory specified must be relative to the location of the input file.
 * @param {string[]} filesToDownload.url is the URL to the raw files that should be downloaded.
 * @param {string} inputFile is the filename that should be passed in to xelatex.
 * @param {*} outputFile is the permanent location the PDF output should be stored.
 */
const WriteLatexFile = async (filesToDownload, inputFile, outputFile) => {
  // Creates a temp directory that is deleted on application exit
  // since temp is set to track (and cleanup) the directories on exit.
  const tempPath = await mkdir();

  // We are letting the file processing start asyncronously but wait for
  // all the files to be downloaded before continuing.
  await Promise.all(filesToDownload.map(async ({ dir, urls }) => {
    const tempDir = join(tempPath, dir);
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    // We are asyncronously downloading all the files but waiting for
    // all the files to be downloaded before continuing.
    await Promise.all(urls.map((url) => downloadFileByURL(url, tempDir)));
  }));

  const outputFileStream = createWriteStream(outputFile);

//   latex(latexFile).pipe(outputFileStream);
};

export default WriteLatexFile;
