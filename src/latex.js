import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { downloadTempFiles } from './io.js';

const WriteLatexFile = async (latexFile, outputFile, assets) => {
  const directory = await downloadTempFiles(assets);

  const outputFileStream = createWriteStream(outputFile);
  //   latex(
  //     latexFile,
  //     {
  //       inputs: resolve(otherAssetsPath),
  //       fonts: resolve(fontsPath),
  //       cmd: 'xelatex',
  //     },
  //   ).pipe(outputFileStream);
  const texProcess = spawn(`xelatex ${la}`);

  texProcess.stdout.on('data', (data) => {
    console.log(`stdout:\n${data}`);
  });

  texProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  texProcess.on('error', (error) => {
    console.error(`error: ${error.message}`);
  });

  texProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

export default WriteLatexFile;
