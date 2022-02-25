import { argv } from 'process';
import npmlog from 'npmlog';
import { join } from 'path';
import ParseArgs from './src/args.js';
import PopulateTemplate from './src/templater.js';
import GetFile from './src/io.js';
import WriteLatexFile from './src/latex.js';

// Directory used when locally running the action so the outputs are less likely
// to be committed to version control.
const TESTING_DIR_NAME = 'action_testing_dir';

const main = async () => {
  const {
    dataUrl,
    templateUrl,
    variableTags,
    fontAssetUrls,
    otherAssetUrls,
    outputFilename,
  } = await ParseArgs(argv);

  try {
    const [template, data] = await Promise.all([
      GetFile(templateUrl),
      GetFile(dataUrl),
    ]);

    const populatedTemplate = await PopulateTemplate(template, data, variableTags);

    let fileRoot;
    if (process.env.CI === 'true') {
      fileRoot = process.env.GITHUB_WORKSPACE;
    } else {
      fileRoot = join('.', TESTING_DIR_NAME);
    }

    WriteLatexFile(
      populatedTemplate,
      fontAssetUrls,
      otherAssetUrls,
      join(fileRoot, outputFilename),
    );
  } catch (err) {
    npmlog.error(err);
  }
};

main();
