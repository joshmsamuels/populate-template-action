import { argv } from 'process';
import axios from 'axios';
import ParseArgs from './src/args';

const getFile = async () => {
  const { dataUrl, templateUrl } = ParseArgs(argv);

  console.log(`data url: ${dataUrl}`);
  console.log(`templateUrl: ${templateUrl}`);

  try {
    const res = await axios.get('https://gist.githubusercontent.com/joshmsamuels/951453f0aade3a132f6c8cbd91fd8a52/raw/a1cdc747bb6cf59e0d6d2faa6cf8753d49482a2e/latex-sample.tex');
    console.log('log', res.data);

    return res.data;
  } catch (err) {
    console.error(err);
  }

  return null;
};

getFile();
