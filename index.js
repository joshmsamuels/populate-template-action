import axios from 'axios';

const getFile = async() => {
    try {
        const res = await axios.get("https://gist.githubusercontent.com/joshmsamuels/951453f0aade3a132f6c8cbd91fd8a52/raw/a1cdc747bb6cf59e0d6d2faa6cf8753d49482a2e/latex-sample.tex")
        console.log("log", res.data)
        console.log(`::set-output name=time::${'NOW'}`)  
        
        return res.data
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
}

getFile()