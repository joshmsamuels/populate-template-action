// A lot of the code in this file was influenced by https://paultopia.github.io/posts-output/mustache-latex/.
// Kudos to Paul for writing such an elegant post that helped me and hopefully many others.

import {
  has, intersection, isArray, isObject, isString,
} from 'lodash-es';
import npmlog from 'npmlog';
import Mustache from 'mustache';

export const LATEX_SPECIAL_CHARS = '#$%&{}_~^\\';

// latex backslashes must be escaped just like in javascript,
// so the regex to match a backslash is \\\\.
const latexSpecialCharsRegex = new RegExp(`[${LATEX_SPECIAL_CHARS}\\]`, 'g');

// TODO: There are a lot of exports of internal functions in this file so they can be tested.
// Is there a way to test the functions without exporting?

/**
 * Checks if two strings are mutally exclusive (0 overlapping characters)
 * @param {string} first - The first string for the comparison.
 * @param {string} second - The second string for the comparison.
 * @returns {boolean} True if the numbers are mutually exclusive, false otherwise
 */
export const areStringsMutuallyExclusive = (first, second) => {
  // Without converting the strings to an array of characters, the intersection function
  // does not work since it looks at whole strings instead of characters.
  // TODO: is there a more efficient way to make this comparison without creating
  // two new in-mem strings that is also easily readable?
  const firstAsChars = [...first];
  const secondAsChars = [...second];

  // If the intersection between the strings is an empty array then they are mutally exclusive
  if (intersection(firstAsChars, secondAsChars).length === 0) {
    return true;
  }

  return false;
};

export const areLatexTagsValid = (customTags) => {
  if (!isString(customTags?.start) || !isString(customTags?.end)) {
    npmlog.error('invalid customTags. Expected an object with strings for "start" and "end" but got', customTags);
    return false;
  }

  if (!areStringsMutuallyExclusive(customTags?.start, LATEX_SPECIAL_CHARS)) {
    npmlog.error(`start tag must not inclue any of the following latex special characters "${LATEX_SPECIAL_CHARS}"`);
    return false;
  }

  if (!areStringsMutuallyExclusive(customTags?.end, LATEX_SPECIAL_CHARS)) {
    npmlog.error(`end tag must not inclue any of the following latex special characters "${LATEX_SPECIAL_CHARS}"`);
    return false;
  }

  return true;
};

// Slightly modified function from https://paultopia.github.io/posts-output/mustache-latex/
export const latexEscaper = (text) => {
  const specialEscapingCharsMap = new Map([
    ['\\', 'textbackslash'],
    ['~', 'textasciitilde'],
    ['^', 'textasciicircum'],
  ]);

  return text.replace(
    latexSpecialCharsRegex,
    (match) => `\\${specialEscapingCharsMap.get(match) || match}`,
  );
};

export const isDataComplete = (tokens, data) => {
  if (!isArray(tokens)) {
    npmlog.error('tokens must be an array but was ', tokens);
    throw Error('tokens is not an array');
  }

  if (!isObject(data)) {
    npmlog.error('data must be an obbject but was ', data);
    throw Error('data is not an object');
  }

  const templateVariables = tokens
    // The implementation of mustache I am using sets the first element of the array to 'name'
    // when there is a variable to be substituted.
    .filter((token) => token[0] === 'name')
    // The implementation of mustache I am using sets the second element of the array to the
    // variable name that will be substituted.
    .map((token) => token[1]);

  // If there are any template variables that do not exist in the data then our data is incomplete.
  return templateVariables.every((variable) => {
    if (!has(data, variable)) {
      return false;
    }

    return true;
  });
};

export const populateLatexTemplate = async (template, data, customTags) => {
  if (!areLatexTagsValid(customTags)) {
    throw Error('Invalid latex tags');
  }
  Mustache.tags = [customTags.start, customTags.end];
  Mustache.escape = latexEscaper;

  // Since mustache replaces undefined variables with empty strings, I wanted to parse
  // the template first and manually validate that all the template variables are filled.
  // Note: Parsed templates are cached by mustache so, when calling render later,
  // the template will not be re-parsed.
  const mustacheTokens = Mustache.parse(template);

  if (!isDataComplete(mustacheTokens, data)) {
    npmlog.error('Template was missing data', template, data);
    throw Error('Not all data in the template was populated');
  }

  return Mustache.render(template, data);
};

const DEFAULT_TAGS = { start: '<<', end: '>>' };

const PopulateTemplate = async (template, data, customTags) => (
  populateLatexTemplate(template, data, customTags ?? DEFAULT_TAGS)
);

export default PopulateTemplate;
