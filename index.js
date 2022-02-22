import { argv } from 'process';
import npmlog from 'npmlog';
import { writeFileSync } from 'fs';
import { join } from 'path';
import ParseArgs from './src/args.js';
import PopulateTemplate from './src/templater.js';
import GetFile from './src/io.js';

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

    if (process.env.CI === 'true') {
      // Writing the final file to a local temp file so it can be deployed to S3
      writeFileSync(
        join(process.env.GITHUB_WORKSPACE, outputFilename),
        populatedTemplate,
      );
    }
  } catch (err) {
    npmlog.error(err);
  }
};

main();
