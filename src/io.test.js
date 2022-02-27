import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { isString, join, sample } from 'lodash-es';
import npmlog from 'npmlog';
import {
  existsSync, mkdirSync, readdirSync, readFileSync, rmSync,
} from 'fs';
import GetFile, { downloadTempFiles } from './io.js';

const getFileAsString = async (fileUrl) => {
  const fileContents = await GetFile(fileUrl);

  if (!isString(fileContents)) {
    return JSON.stringify(fileContents);
  }

  return fileContents;
};

describe('downloadFilesToDirectory', () => {
  let testDirectory;

  beforeAll(() => {
    testDirectory = join(tmpdir(), 'populateTemplateAction', 'downloadFilesToDirectory');

    if (!existsSync(testDirectory)) {
      // equivalent to rm -rf
      rmSync(testDirectory, { recursive: true, force: true });
    }

    mkdirSync(testDirectory, { recursive: true });
  });

  afterAll(() => {
    // equivalent to rm -rf
    rmSync(testDirectory, { recursive: true, force: true });
  });

  test('downloading a file works', async () => {
    const fileUrl = 'https://gist.githubusercontent.com/joshmsamuels/96e1424acbe7e935493456c8d7b41ed1/raw/b80a57f73a4f5816a1b374170972740cccb96d39/populate-template-action-sample-data.json';
    const expectedFilename = 'populate-template-action-sample-data.json';

    await downloadTempFiles([fileUrl], testDirectory);

    const files = readdirSync(testDirectory);

    expect(files).toHaveLength(1);
    expect(files[0]).toBe(expectedFilename);

    const fileContents = readFileSync(join(testDirectory, expectedFilename), { encoding: 'utf-8' });
    const urlContents = await getFileAsString(fileUrl);

    expect(fileContents).toBe(urlContents);
  });

  test('downloading two of the same file does not crash or write the same file twice', async () => {
    const fileUrl = 'https://gist.githubusercontent.com/joshmsamuels/96e1424acbe7e935493456c8d7b41ed1/raw/b80a57f73a4f5816a1b374170972740cccb96d39/populate-template-action-sample-data.json';
    const expectedFilename = 'populate-template-action-sample-data.json';

    await downloadTempFiles([fileUrl, fileUrl], testDirectory);

    const files = readdirSync(testDirectory);

    expect(files).toHaveLength(1);
    expect(files[0]).toBe(expectedFilename);

    const fileContents = readFileSync(join(testDirectory, expectedFilename), { encoding: 'utf-8' });
    const urlContents = await getFileAsString(fileUrl);

    expect(fileContents).toBe(urlContents);
  });

  test('downloading two files works', async () => {
    const fileUrls = [
      'https://gist.githubusercontent.com/joshmsamuels/96e1424acbe7e935493456c8d7b41ed1/raw/b80a57f73a4f5816a1b374170972740cccb96d39/populate-template-action-sample-data.json',
      'https://gist.githubusercontent.com/joshmsamuels/951453f0aade3a132f6c8cbd91fd8a52/raw/56d6e6180e67cb8445a6e790809a4beb618c1640/populate-template-action-sample-template.tex',
    ];
    const expectedFilenames = ['populate-template-action-sample-data.json', 'populate-template-action-sample-template.tex'];

    await downloadTempFiles(fileUrls, testDirectory);

    const files = readdirSync(testDirectory);

    expect(files).toHaveLength(expectedFilenames.length);
    expect(files).toEqual(expect.arrayContaining(expectedFilenames));

    expectedFilenames.forEach(async (filename) => {
      const fileUrl = fileUrls.find((url) => url.includes(filename));
      expect(fileUrl).toBeDefined();

      const fileContents = readFileSync(join(testDirectory, filename), { encoding: 'utf-8' });
      const urlContents = await getFileAsString(fileUrl);

      expect(fileContents).toBe(urlContents);
    });
  });

  test('downloading a file works and a new directory can be created', async () => {
    // Delete our test directory to test downloadFilesToDirectory's create dir
    // equivalent to rm -rf
    rmSync(testDirectory, { recursive: true, force: true });

    const fileUrl = 'https://gist.githubusercontent.com/joshmsamuels/96e1424acbe7e935493456c8d7b41ed1/raw/b80a57f73a4f5816a1b374170972740cccb96d39/populate-template-action-sample-data.json';
    const expectedFilename = 'populate-template-action-sample-data.json';

    await downloadTempFiles([fileUrl], testDirectory);

    const files = readdirSync(testDirectory);

    expect(files).toHaveLength(1);
    expect(files[0]).toBe(expectedFilename);

    const fileContents = readFileSync(join(testDirectory, expectedFilename), { encoding: 'utf-8' });
    const urlContents = await getFileAsString(fileUrl);

    expect(fileContents).toBe(urlContents);
  });
});

describe('downloadFilesToDirectory with invalid inputs', () => {
  beforeEach(() => {
    npmlog.error = jest.fn();
  });

  afterEach(() => {
    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });

  test('Throw an error when fileUrls is not an array', async () => {
    const invalidFileUrlParams = [3, 'string', { obj: true }];
    await expect(() => downloadTempFiles(sample(invalidFileUrlParams))).rejects.toThrow(Error('Parameter fileUrls is invalid'));
  });

  test('Throw an error when fileUrls contains a non-string element', async () => {
    const invalidFileUrlElement = [null, undefined, 3, ['string'], { obj: true }];
    const fileUrls = ['valid parameter', sample(invalidFileUrlElement), 'anotherValidElement'];

    await expect(() => downloadTempFiles(fileUrls)).rejects.toThrow(Error('One or more URLs are invalid'));
  });

  test('Throw an error when dir is not a string', async () => {
    const invalidDir = [null, undefined, 3, ['string'], { obj: true }];
    await expect(() => downloadTempFiles([], invalidDir)).rejects.toThrow(Error('Invalid Directory'));
  });
});

describe('GetFile', () => {
  test('with a valid URL', async () => {
    // Since updating a gist generates a new URL, 🤞 this test will not break
    // TODO: Mock this test so it does not rely on gists being static or
    // be slow from a network connection.
    const res = await GetFile('https://gist.githubusercontent.com/joshmsamuels/951453f0aade3a132f6c8cbd91fd8a52/raw/ff265747d0d6840c8af2a0f137bb01d25fbfeef3/populate-template-action-sample-template.tex');
    expect(res).toMatchSnapshot();
  });

  test('with an invalid file path', async () => {
    npmlog.error = jest.fn();

    await expect(() => GetFile('www.example.com')).rejects.toThrow(Error('www.example.com is not a valid URL'));

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });
});
