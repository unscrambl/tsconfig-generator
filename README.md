# tsconfig-generator
Creates a tsconfig.json file from a template configuration that includes references to environment variables. 
Use the `${ENV_VARIABLE}` pattern for substituting environment variable value.

```
npm install tsconfig-generator
```

```
Usage: index [options]

  Options:

    -V, --version              output the version number
    -i, --input [inputFile]    Specifies the path of the input JSON file
    -o, --output [outputFile]  Specifies the path of the output JSON file
    -h, --help                 output usage information
```