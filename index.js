#!/usr/bin/env node
const fs = require('fs');
const isValidPath = require('is-valid-path');
const path = require('path');
const program = require('commander');

const DEFAULT_TS_CONFIG_FILE_PATH = './tsconfig.json';
const DEFAULT_JSON_INDENTATION = 4;

program
    .version('0.0.1')
    .option('-i, --input [inputFile]', 'Input JSON file')
    .option('-o, --output [outputFile]', 'Output JSON file')
    .parse(process.argv);

generateTSConfig(program.input, program.output);

function generateTSConfig(inputFilePath, outputFilePath)
{
    let config = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

    walkTheObjectAndReplaceEnvironmentVariables(config);
    fs.writeFileSync(outputFilePath ? outputFilePath : DEFAULT_TS_CONFIG_FILE_PATH, JSON.stringify(config, null,
        DEFAULT_JSON_INDENTATION));
    console.log(`Successfully created the file '${outputFilePath}'.`);
}

function walkTheObjectAndReplaceEnvironmentVariables(config)
{
    const environmentVariableRegex = new RegExp(/\$\{([\w]+)\}/);

    for (let key in config)
    {
        if (typeof config[key] === 'object')
        {
            walkTheObjectAndReplaceEnvironmentVariables(config[key]);
        }
        else
        {
            if (typeof config[key] === 'string')
            {
                const matched = config[key].match(environmentVariableRegex);
                if (matched)
                {
                    const environmentVariableValue = process.env[matched[1]];
                    if(!environmentVariableValue){
                        console.log(`WARNING: Environment variable '${matched[1]}' has no value. Skipping.`)
                    }
                    else if (isValidPath(environmentVariableValue))
                    {
                        config[key] = config[key].replace(environmentVariableRegex, path.relative(process.cwd(),
                            environmentVariableValue));
                    }
                    else
                    {
                        console.log(`WARNING: '${matched[1]}' is not a valid path. Using the actual value '${environmentVariableValue}'.`);
                        config[key] = config[key].replace(environmentVariableRegex, environmentVariableValue);
                    }
                }
            }
        }
    }
}