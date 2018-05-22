const assert = require('assert');
const execSync = require('child_process').execSync;
const fs = require('fs');

describe('tsconfig-generator', () =>{
    const generatedFilePath = 'test/tsconfig.json';

    before(() =>{
        // NOTE: Using relative paths to make sure that the tests work on any CWD. 
        process.env['TEST_NODE_PATH'] = '../../test/node/path';
        process.env['TEST_GIT_ROOT'] = '../../test/git/root';
    });

    after(() => {
        fs.unlinkSync(generatedFilePath);
    });

    it('can generate the tsconfig.json with environment variables', () =>
    {
        let expectedFileBuffer = null; 
        let generatedFileBuffer = null; 

        let inputFilePath = 'test/tsconfig.base1.json';
        let expectedFilePath = 'test/tsconfig.expected1.json';
        execSync(`./index.js -i ${inputFilePath} -o ${generatedFilePath}`);
        assert(checkFileEquality(expectedFilePath, generatedFilePath));
    });

    function checkFileEquality(expectedFilePath, generatedFilePath){
        expectedFileBuffer = fs.readFileSync(expectedFilePath);
        generatedFileBuffer = fs.readFileSync(generatedFilePath);
        return expectedFileBuffer.equals(generatedFileBuffer);
    }
});