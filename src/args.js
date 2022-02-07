import { isArray } from 'lodash-es';

const DATA_URL_KEY = 'data-url=';
const TEMPLATE_URL_KEY = 'template-url=';

// Eslint requires us to disable the line length here since one-line fat arrow functions are
// required when possible (e.g one line function) and it does not permit arbitrary new lines.
// See: https://github.com/airbnb/javascript/issues/1532 for more details on the conversation.
// eslint-disable-next-line max-len
const findArgument = (args, prefix) => args?.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);

const ParseArgs = (argv) => {
  if (!isArray(argv)) {
    console.error('ParseArgs argv must be an array but was', argv);
    throw Error('ParseArgs argv is not an array');
  }

  // Removing the first two arguments from the array since "real" args start from the 3rd element.
  // The first element is the program (e.g. Node) and the second argument is the app name.
  const args = argv?.slice(2);

  return {
    dataUrl: findArgument(args, DATA_URL_KEY),
    templateUrl: findArgument(args, TEMPLATE_URL_KEY),
  };
};

export default ParseArgs;
