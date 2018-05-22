#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');

const DEFAULT_TS_CONFIG_FILE_PATH = './tsconfig.json';
const DEFAULT_JSON_INDENTATION = 4;
const environmentVariableRegex = new RegExp(/\$\{([\w]+)\}/, 'g');
const pathVariableRegex = new RegExp(/#\{([\w]+)\}/, 'g');

program
    .version('0.0.2')
    .option('-i, --input [inputFile]', 'Input JSON file path')
    .option('-o, --output [outputFile]', 'Output JSON file path (Default: ./tsconfig.json)')
    .parse(process.argv);

generateTSConfig(program.input, program.output);

function generateTSConfig(inputFilePath, outputFilePath = DEFAULT_TS_CONFIG_FILE_PATH)
{
    let config = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

    walkTheObjectAndReplaceEnvironmentVariables(config, outputFilePath);
    fs.writeFileSync(outputFilePath ? outputFilePath : DEFAULT_TS_CONFIG_FILE_PATH, JSON.stringify(config, null,
        DEFAULT_JSON_INDENTATION));
    console.log(`Successfully created the file '${outputFilePath}'.`);
}

function walkTheObjectAndReplaceEnvironmentVariables(config, outputFilePath)
{
    for (let key in config)
    {
        if (typeof config[key] === 'object')
        {
            walkTheObjectAndReplaceEnvironmentVariables(config[key], outputFilePath);
        }
        else
        {
            if (typeof config[key] === 'string')
            {
                config[key] = replaceMatchedAll(environmentVariableRegex, config[key], outputFilePath);
                config[key] = replaceMatchedAll(pathVariableRegex, config[key], outputFilePath);
            }
        }
    }
}

function replaceMatchedAll(regex, text, outputFilePath)
{
    let matched = null;

    do {
        matched = regex.exec(text);
        if (matched)
        {
            const environmentVariableValue = process.env[matched[1]];
            if (!environmentVariableValue)
            {
                console.log(`WARNING: Environment variable '${matched[1]}' has no value. Skipping.`);
            }
            else if (regex === pathVariableRegex)
            {
                text = text.replace(matched[0], path.relative(path.dirname(outputFilePath),
                    environmentVariableValue));
            }
            else if (regex === environmentVariableRegex)
            {
                console.log(
                    `WARNING: '${matched[1]}' is not a valid path. Using the actual value '${environmentVariableValue}'.`
                );
                text = text.replace(matched[0], environmentVariableValue);
            }
        }
    } while (matched);
    return text;
}