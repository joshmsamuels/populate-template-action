import { isArray } from 'lodash-es';
import npmlog from 'npmlog';

const DATA_URL_KEY = 'data-url=';
const TEMPLATE_URL_KEY = 'template-url=';
const VARIABLE_TAGS_KEY = 'variable-tags=';
const OUTPUT_FILENAME = 'output-filename=';

const findArgument = (args, prefix) => (
  args?.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) ?? null
);

const ParseArgs = (argv) => {
  if (!isArray(argv)) {
    npmlog.error('ParseArgs argv must be an array but was ', argv);
    throw Error('ParseArgs argv is not an array');
  }

  // Removing the first two arguments from the array since "real" args start from the 3rd element.
  // The first element is the program (e.g. Node) and the second argument is the app name.
  const args = argv?.slice(2);

  return {
    dataUrl: findArgument(args, DATA_URL_KEY),
    templateUrl: findArgument(args, TEMPLATE_URL_KEY),
    variableTags: JSON.parse(findArgument(args, VARIABLE_TAGS_KEY)),
    outputFilename: findArgument(args, OUTPUT_FILENAME),
  };
};

export default ParseArgs;
