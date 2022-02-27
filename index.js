import { argv } from 'process';
import npmlog from 'npmlog';
import { join, resolve } from 'path';
import ParseArgs from './src/args.js';
import PopulateTemplate from './src/templater.js';
import GetFile from './src/io.js';
import WriteLatexFile from './src/latex.js';

const main = async () => {
  const {
    dataUrl,
    templateUrl,
    variableTags,
    fontAssetUrls,
    resumeAssetUrls,
    topLevelAssetUrls,
    outputFilename,
  } = await ParseArgs(argv);

  try {
    const [template, data] = await Promise.all([
      GetFile(templateUrl),
      GetFile(dataUrl),
    ]);

    const populatedTemplate = await PopulateTemplate(template, data, variableTags);

    let persistentDir;
    if (process.env.CI === 'true') {
      persistentDir = resolve(process.env.GITHUB_WORKSPACE);
    } else {
      persistentDir = resolve('.');
    }

    WriteLatexFile(
      populatedTemplate,
      join(persistentDir, outputFilename),
      [
        { downloadDir: 'fonts', urls: fontAssetUrls },
        { downloadDir: 'resume', urls: resumeAssetUrls },
        { downloadDir: '.', urls: topLevelAssetUrls },

      ],
    );
  } catch (err) {
    npmlog.error(err);
  }
};

main();
