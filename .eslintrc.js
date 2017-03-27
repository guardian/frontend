module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
        jest: true,
    },
    // eslint-config-prettier disables formatting rules from other configs (i.e. airbnb)
    extends: ['airbnb', 'prettier'],

    // eslint-plugin-prettier switches prettier on
    plugins: ['prettier'],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 6,
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        // prettier settings
        'prettier/prettier': [
            'error',
            {
                trailingComma: 'es5',
                singleQuote: true,
                bracketSpacing: true,
                tabWidth: 4,
            },
        ],
        'no-extend-native': 'error',
        'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    },
    // don't look for eslintrcs above here
    root: true,
};
