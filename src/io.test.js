import {
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import npmlog from 'npmlog';
import GetFile from './io';

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
