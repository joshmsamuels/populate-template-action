import { argv } from 'process';
import axios from 'axios';
import npmlog from 'npmlog';
import { writeFileSync } from 'fs';
import { join } from 'path';
import ParseArgs from './src/args.js';

const getFile = async () => {
  const { dataUrl, templateUrl, outputFilename } = ParseArgs(argv);

  npmlog.info(`data url: ${dataUrl}`);
  npmlog.info(`templateUrl: ${templateUrl}`);
  npmlog.info(`outputFilename: ${outputFilename}`);

  try {
    const res = await axios.get('https://gist.githubusercontent.com/joshmsamuels/951453f0aade3a132f6c8cbd91fd8a52/raw/a1cdc747bb6cf59e0d6d2faa6cf8753d49482a2e/latex-sample.tex');
    npmlog.info('log', res.data);

    writeFileSync(
      join(process.env.GITHUB_WORKSPACE, outputFilename),
      res.data,
    );

    return res.data;
  } catch (err) {
    npmlog.error(err);
  }

  return null;
};

getFile();
