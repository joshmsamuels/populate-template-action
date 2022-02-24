import { createWriteStream } from 'fs';
import latex from 'node-latex';

const WriteLatexFile = async (latexFile, outputFilePath) => {
  const outputFileStream = createWriteStream(outputFilePath);

  latex(latexFile).pipe(outputFileStream);
};

export default WriteLatexFile;
