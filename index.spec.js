const assert = require('assert');
const execSync = require('child_process').execSync;
const fs = require('fs');

describe('tsconfig-generator', () =>
{
    const generatedFilePath = 'test/tsconfig.json';

    before(() =>
    {
        // NOTE: Using relative paths to make sure that the tests work on any CWD. 
        process.env['TEST_NODE_PATH'] = '../../test/node/path';
        process.env['TEST_GIT_ROOT'] = '../../test/git/root';
        process.env['PROJECT_NAME'] = 'foo';
    });

    after(() =>
    {
        fs.unlinkSync(generatedFilePath);
    });

    it('can generate the tsconfig.json with environment variables', () =>
    {
        let inputFilePath = 'test/tsconfig.sample1.json';
        let expectedFilePath = 'test/tsconfig.expected1.json';
        execSync(`./index.js -i ${inputFilePath} -o ${generatedFilePath}`);
        assert(checkFileEquality(expectedFilePath, generatedFilePath));
    });

    it('should throw an error if the configuration template includes an invalid environment variable', () =>
    {
        let inputFilePath = 'test/tsconfig.sample2.json';
        assert.throws(() => { execSync(`./index.js -i ${inputFilePath} -o ${generatedFilePath}`, { stdio: 'ignore' }); });
    });

    function checkFileEquality(expectedFilePath, generatedFilePath)
    {
        let expectedFileBuffer = fs.readFileSync(expectedFilePath);
        let generatedFileBuffer = fs.readFileSync(generatedFilePath);
        return expectedFileBuffer.equals(generatedFileBuffer);
    }
});