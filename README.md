# tsconfig-generator
Creates a tsconfig.json by using the paths defined with environment variables. Use the pattern `${ENV_VARIABLE}` for 
any string environment variables and use `#{ENV_VARIABLE}` pattern for path variables that are going to be converted 
to a relative import.  

```
npm install tsconfig-generator
```

```
Usage: index [options]

  Options:

    -V, --version              output the version number
    -i, --input [inputFile]    Input JSON file path
    -o, --output [outputFile]  Output JSON file path (Default: ./tsconfig.json)
    -h, --help                 output usage information
```