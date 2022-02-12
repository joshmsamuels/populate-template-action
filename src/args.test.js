import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import npmlog from 'npmlog';
import { argv } from 'process';
import ParseArgs from './args.js';

describe('ParseArgs with valid data', () => {
  test('data and template URLs can be pulled out of the args', () => {
    const expectedArgs = {
      dataUrl: 'www.example.com',
      templateUrl: 'www.example.com',
      outputFilename: 'output.txt',
    };

    const testArgs = [
      ...argv,
      `data-url=${expectedArgs.dataUrl}`,
      `template-url=${expectedArgs.templateUrl}`,
      `output-filename=${expectedArgs.outputFilename}`,
    ];

    const actual = ParseArgs(testArgs);
    expect(actual.dataUrl).toBe(expectedArgs.dataUrl);
    expect(actual.templateUrl).toBe(expectedArgs.templateUrl);
    expect(actual.outputFilename).toBe(expectedArgs.outputFilename);
  });

  test('data URL can be pulled out of the args when template URL is not present', () => {
    const expectedArgs = {
      dataUrl: 'www.example.com',
    };

    const testArgs = [
      ...argv,
      `data-url=${expectedArgs.dataUrl}`,
    ];

    const actual = ParseArgs(testArgs);
    expect(actual.dataUrl).toBe(expectedArgs.dataUrl);
    expect(actual.templateUrl).toBeFalsy();
  });

  test('template URL can be pulled out of the args when data URL is not present', () => {
    const expectedArgs = {
      templateUrl: 'www.example.com',
    };

    const testArgs = [
      ...argv,
      `template-url=${expectedArgs.templateUrl}`,
    ];

    const actual = ParseArgs(testArgs);
    expect(actual.dataUrl).toBeFalsy();
    expect(actual.templateUrl).toBe(expectedArgs.templateUrl);
  });

  test('data and template URLs are falsy when not present in the arguments', () => {
    const testArgs = [
      ...argv,
      'randomArgument',
    ];

    const actual = ParseArgs(testArgs);
    expect(actual.dataUrl).toBeFalsy();
    expect(actual.templateUrl).toBeFalsy();
  });

  test('data and template URLs are falsy with one random argument', () => {
    const testArgs = [
      'randomArgument',
    ];

    const actual = ParseArgs(testArgs);
    expect(actual.dataUrl).toBeFalsy();
    expect(actual.templateUrl).toBeFalsy();
  });

  test('data and template URLs are falsy with one random argument', () => {
    const testArgs = [
      'randomArgument',
    ];

    const actual = ParseArgs(testArgs);
    expect(actual.dataUrl).toBeFalsy();
    expect(actual.templateUrl).toBeFalsy();
  });
});

describe('ParseArgs with invalid data', () => {
  beforeEach(() => {
    npmlog.error = jest.fn();
  });

  afterEach(() => {
    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });

  test('Throw an error when args are null', () => {
    expect(() => ParseArgs()).toThrow();
  });

  test('Throw an error when args is a number', () => {
    expect(() => ParseArgs(123)).toThrow();
  });

  test('Throw an error when args is an empty object', () => {
    expect(() => ParseArgs({})).toThrow();
  });
});
