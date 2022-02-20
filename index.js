import { argv } from 'process';
import axios from 'axios';
import npmlog from 'npmlog';
import { writeFileSync } from 'fs';
import { join } from 'path';
import ParseArgs from './src/args.js';
import PopulateTemplate from './src/templater.js';

const getFile = async () => {
  const { dataUrl, templateUrl, outputFilename } = ParseArgs(argv);

  try {
    const template = await (await axios.get(templateUrl)).data;
    const data = await (await axios.get(dataUrl)).data;

    const populatedTemplate = await PopulateTemplate(template, data);

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

getFile();
