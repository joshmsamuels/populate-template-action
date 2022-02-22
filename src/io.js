import axios from 'axios';
import npmlog from 'npmlog';

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

export default GetFile;
