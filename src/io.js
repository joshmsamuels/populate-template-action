import axios from 'axios';
import { isString } from 'lodash-es';
import npmlog from 'npmlog';
import { createWriteStream } from 'fs';
import { basename, join } from 'path';
import { promisify } from 'util';
import { finished } from 'stream';
import { resolve } from 'dns';

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

const getFileContentsByURL = async (url) => {
  const res = await axios.get(url);
  return res.data;
};

// Converts a streams finished response from a callback to a promise
const finishedPromise = promisify(finished);

/**
 * Downloads the data from the specified URL to the given location.
 * @param {string} url is the URL of the file that should be downloaded
 * @param {string} downloadLocation is the location the file should be downloaded to. A file name
 * should not be specified since it is pulled off the URL.
 * @returns {string} The absolute path to the file that was downloaded.
 */
export const downloadFileByURL = async (url, downloadLocation) => {
  if (!isString(downloadLocation)) {
    npmlog.error('A string download location is required for streaming get requests but got', downloadLocation);
    throw Error('getFileStreamByURL requires a download location');
  }

  const res = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  const downloadedFilePath = resolve(join(downloadLocation, basename(url)));

  // The file will be saved in the specified directory, where the filename is pulled off the URL
  const writeStream = createWriteStream(downloadedFilePath);

  res.data.pipe(writeStream);
  await finishedPromise(writeStream);

  return downloadedFilePath;
};

const GetFile = async (fileLocation) => {
  if (!isHttpUrl(fileLocation)) {
    // TODO: Support specifying local files
    throw Error(`${fileLocation} is not a valid URL`);
  }

  return getFileContentsByURL(fileLocation);
};

export default GetFile;
