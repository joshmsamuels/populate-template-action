import {
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import npmlog from 'npmlog';
import Mustache from 'mustache';
import { omit } from 'lodash-es';
import PopulateTemplate, {
  areLatexTagsValid,
  areStringsMutuallyExclusive,
  isDataComplete,
  latexEscaper,
  populateLatexTemplate,
} from './templater.js';

const DEFAULT_TAGS = {
  start: '<<',
  end: '>>',
};
const DEFAULT_TEMPLATE = '<<variable1>> is better than <<variable2>>';
const DEFAULT_TEMPLATE_DATA = {
  variable1: 'coffee',
  variable2: 'tea',
};
const POPULATED_DEFAULT_TEMPLATE = 'coffee is better than tea';

describe('areStringsMutuallyExclusive', () => {
  test('with two mutually exclusive strings', () => {
    expect(areStringsMutuallyExclusive('abc', 'defgh')).toBe(true);
  });

  test('with two strings, one overlapping character', () => {
    expect(areStringsMutuallyExclusive('abd', 'def')).toBe(false);
  });

  test('with two identical strings', () => {
    expect(areStringsMutuallyExclusive('abc', 'abc')).toBe(false);
  });
});

describe('areLatexTagsValid', () => {
  test('with valid start and end tags', () => {
    expect(areLatexTagsValid(DEFAULT_TAGS)).toBe(true);
  });

  test('with valid start tag and invalid end tag', () => {
    npmlog.error = jest.fn();

    const tags = {
      start: '<<',
      end: '%>',
    };
    expect(areLatexTagsValid(tags)).toBe(false);

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });

  test('with invalid start tag and valid end tag', () => {
    npmlog.error = jest.fn();

    const tags = {
      start: '<%',
      end: '>>',
    };
    expect(areLatexTagsValid(tags)).toBe(false);

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });

  test('with valid start tag and no end tag', () => {
    npmlog.error = jest.fn();

    const tags = {
      start: '<<',
    };
    expect(areLatexTagsValid(tags)).toBe(false);

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });

  test('with no start tag and a valid end tag', () => {
    npmlog.error = jest.fn();

    const tags = {
      end: '>>',
    };
    expect(areLatexTagsValid(tags)).toBe(false);

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });
});

describe('latexEscaper', () => {
  // Strings without a latex special character should be the same
  // Strings that are a latex special character should be escaped with a backslash (\)
  // Strings that have a special escaping (\ ~ ^ as of today) should be escaped to \specialEscaping,
  // where specialEscaping is the latex name for the escape character.
  test.each`
    inputString | outputString
    ${'abc'}    | ${'abc'}
    ${'ab\\'}   | ${'ab\\textbackslash'}
    ${'ab~'}    | ${'ab\\textasciitilde'}
    ${'ab^'}    | ${'ab\\textasciicircum'}
    ${'ab#'}    | ${'ab\\#'}
    ${'ab$'}    | ${'ab\\$'}
    ${'ab%'}    | ${'ab\\%'}
    ${'ab&'}    | ${'ab\\&'}
    ${'ab{'}    | ${'ab\\{'}
    ${'ab}'}    | ${'ab\\}'}
    ${'ab_'}    | ${'ab\\_'}    
    ${'ab_%^'}    | ${'ab\\_\\%\\textasciicircum'}    
  `('latexEscaper should convert \'$inputString\' to \'$outputString\'', ({ inputString, outputString }) => {
    expect(latexEscaper(inputString)).toBe(outputString);
  });
});

describe('populateLatexTemplate', () => {
  test('with a valid template, data, and tags', async () => {
    await expect(populateLatexTemplate(
      DEFAULT_TEMPLATE,
      DEFAULT_TEMPLATE_DATA,
      DEFAULT_TAGS,
    )).resolves.toBe(POPULATED_DEFAULT_TEMPLATE);
  });

  test('with a valid template and data and invalid tags', async () => {
    const tags = {
      start: '<%',
      end: '%>',
    };

    npmlog.error = jest.fn();

    await expect(() => populateLatexTemplate(
      DEFAULT_TEMPLATE,
      DEFAULT_TEMPLATE_DATA,
      tags,
    )).rejects.toThrow(Error('Invalid latex tags'));

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });

  test('with a valid template, data and tags where there are more template variables than data variables', async () => {
    const template = `${DEFAULT_TEMPLATE} and <<variable3>>`;

    npmlog.error = jest.fn();

    await expect(() => populateLatexTemplate(
      template,
      DEFAULT_TEMPLATE_DATA,
      DEFAULT_TAGS,
    )).rejects.toThrow(Error('Not all data in the template was populated'));

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });
});

describe('isDataComplete', () => {
  test('with complete data for the template', () => {
    const tokens = Mustache.parse(
      DEFAULT_TEMPLATE,
      [DEFAULT_TAGS.start, DEFAULT_TAGS.end],
    );
    expect(isDataComplete(tokens, DEFAULT_TEMPLATE_DATA)).toBe(true);
  });

  test('with more data than needed for the template', () => {
    const tokens = Mustache.parse(
      DEFAULT_TEMPLATE,
      [DEFAULT_TAGS.start, DEFAULT_TAGS.end],
    );

    const data = {
      ...DEFAULT_TEMPLATE_DATA,
      extraData: true,
    };
    expect(isDataComplete(tokens, data)).toBe(true);
  });

  test('with no data for the template', () => {
    const tokens = Mustache.parse(
      DEFAULT_TEMPLATE,
      [DEFAULT_TAGS.start, DEFAULT_TAGS.end],
    );

    const data = {};

    expect(isDataComplete(tokens, data)).toBe(false);
  });

  test('with incomplete data for the template', () => {
    const tokens = Mustache.parse(
      DEFAULT_TEMPLATE,
      [DEFAULT_TAGS.start, DEFAULT_TAGS.end],
    );

    const data = omit(DEFAULT_TEMPLATE_DATA, ['variable2']);

    expect(isDataComplete(tokens, data)).toBe(false);
  });

  test('with an invalid type for tokens', async () => {
    npmlog.error = jest.fn();

    expect(() => isDataComplete(
      {
        isThisARealToken: 'No!!',
      },
      DEFAULT_TEMPLATE_DATA,
    )).toThrow(Error('tokens is not an array'));

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });

  test('with an invalid type for data', async () => {
    npmlog.error = jest.fn();

    expect(() => isDataComplete(
      ['tokens', 'array'],
      'templateData',
    )).toThrow(Error('data is not an object'));

    expect(npmlog.error).toHaveBeenCalled();
    jest.clearAllMocks();
  });
});

describe('PopulateTemplate', () => {
  test('with valid template, data, and tags', async () => {
    await expect(PopulateTemplate(
      DEFAULT_TEMPLATE,
      DEFAULT_TEMPLATE_DATA,
      DEFAULT_TAGS,
    )).resolves.toBe(POPULATED_DEFAULT_TEMPLATE);
  });

  test('with valid template and data, and no tags', async () => {
    await expect(PopulateTemplate(
      DEFAULT_TEMPLATE,
      DEFAULT_TEMPLATE_DATA,
    )).resolves.toBe(POPULATED_DEFAULT_TEMPLATE);
  });
});
