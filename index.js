#!/usr/bin/env node

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const program = require('commander');

const DEFAULT_TS_CONFIG_FILE_PATH = './tsconfig.json';
const DEFAULT_JSON_INDENTATION = 4;
const environmentVariableRegex = new RegExp(/\$\{([\w]+)\}/, 'g');

program
    .version('0.0.5')
    .option('-i, --input [inputFile]', 'Specifies the path of the input JSON file')
    .option('-o, --output [outputFile]', 'Specifies the path of the output JSON file')
    .parse(process.argv);

generateTSConfig(program.input, program.output);

function generateTSConfig(inputFilePath, outputFilePath = DEFAULT_TS_CONFIG_FILE_PATH)
{
    let config = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

    replaceConfigKeyIfExists(config, 'compilerOptions.baseUrl', path.dirname(outputFilePath));
    replaceConfigKeyIfExists(config, 'extends', path.dirname(outputFilePath));
    
    const absoluteBaseUrlPath = replaceAllMatches(environmentVariableRegex, config.compilerOptions.baseUrl);

    walkTheObjectAndReplaceEnvironmentVariables(config, absoluteBaseUrlPath);
    fs.writeFileSync(outputFilePath ? outputFilePath : DEFAULT_TS_CONFIG_FILE_PATH, JSON.stringify(config, null,
        DEFAULT_JSON_INDENTATION));
    console.log(`Successfully created the file '${outputFilePath}'.`);
}

function walkTheObjectAndReplaceEnvironmentVariables(config, absoluteBaseUrlPath)
{
    for (let key in config)
    {
        if (typeof config[key] === 'object')
        {
            walkTheObjectAndReplaceEnvironmentVariables(config[key], absoluteBaseUrlPath);
        }
        else
        {
            if (typeof config[key] === 'string')
            {
                config[key] = replaceAllMatches(environmentVariableRegex, config[key]);
                if (path.isAbsolute(path.dirname(config[key])))
                {
                    config[key] = getRelativePathTo(absoluteBaseUrlPath, config[key]);
                }
            }
        }
    }
}

function getRelativePathTo(baseDir, targetPath)
{
    const relativePath = path.relative(baseDir, path.isAbsolute(path.dirname(targetPath)) ? targetPath :
        path.dirname(targetPath));

    if (path.dirname(relativePath) === '.')
    {
        return './' + relativePath;
    }
    return relativePath;
}

function replaceAllMatches(regex, text)
{
    return text.replace(regex, function (substring, variableName)
    {
        const environmentVariableValue = process.env[variableName];
        if (!environmentVariableValue)
        {
            throw new Error(`environment variable '${variableName}' has no value.`);
        }
        return process.env[variableName];
    });
}

function replaceConfigKeyIfExists(config, keyPathToReplace, targetPath)
{
    if(!_.has(config, keyPathToReplace))
    {
        return; 
    }
    
    const valueToReplace = _.get(config, keyPathToReplace);
    const pathFromEnvVar = replaceAllMatches(environmentVariableRegex, valueToReplace);
    _.set(config, keyPathToReplace, path.isAbsolute(pathFromEnvVar) ? getRelativePathTo(targetPath, pathFromEnvVar) : pathFromEnvVar);
}