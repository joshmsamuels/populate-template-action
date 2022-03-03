import { argv, exit } from 'process';
import npmlog from 'npmlog';
import { join } from 'path';
import ParseArgs from './src/args.js';
import PopulateTemplate from './src/templater.js';
import GetFile from './src/io.js';
import WriteLatexFile from './src/latex.js';

const main = async () => {
  const {
    dataUrl,
    templateUrl,
    variableTags,
    outputFilename,
  } = await ParseArgs(argv);

  try {
    const [template, data] = await Promise.all([
      GetFile(templateUrl),
      GetFile(dataUrl),
    ]);

    const populatedTemplate = await PopulateTemplate(template, data, variableTags);

    const outputLocation = process.env.GITHUB_WORKSPACE ?? '.';
    WriteLatexFile(populatedTemplate, join(outputLocation, outputFilename));
  } catch (err) {
    npmlog.error(err);
    exit(1);
  }
};

main();
