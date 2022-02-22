import { isArray } from 'lodash-es';
import npmlog from 'npmlog';

const DATA_URL_KEY = 'data-url=';
const TEMPLATE_URL_KEY = 'template-url=';
const VARIABLE_TAGS_KEY = 'variable-tags=';
const OUTPUT_FILENAME = 'output-filename=';

const findArgument = async (args, prefix) => (
  args?.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) ?? null
);

const ParseArgs = async (argv) => {
  if (!isArray(argv)) {
    npmlog.error('ParseArgs argv must be an array but was ', argv);
    throw Error('ParseArgs argv is not an array');
  }

  // Removing the first two arguments from the array since "real" args start from the 3rd element.
  // The first element is the program (e.g. Node) and the second argument is the app name.
  const args = argv?.slice(2);

  // By starting all the promises before awaiting any of them the code will utilize more cores
  // to find all the arguments faster. To learn more about why check out this helpful
  // mozilla dev article https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await#handling_asyncawait_slowdown.
  const findDataUrlPromise = findArgument(args, DATA_URL_KEY);
  const findTemplateUrlPromise = findArgument(args, TEMPLATE_URL_KEY);
  const findVariableTagsPromise = findArgument(args, VARIABLE_TAGS_KEY);
  const findOutputFilenamePromise = findArgument(args, OUTPUT_FILENAME);

  return {
    dataUrl: await findDataUrlPromise,
    templateUrl: await findTemplateUrlPromise,
    variableTags: JSON.parse(await findVariableTagsPromise),
    outputFilename: await findOutputFilenamePromise,
  };
};

export default ParseArgs;
