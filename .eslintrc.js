module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
    },
    extends: 'airbnb',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 6,
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        indent: [
            'error',
            4, {
                SwitchCase: 1,
                MemberExpression: 1,
            },
        ],
        'linebreak-style': [
            'error',
            'unix',
        ],
        quotes: [
            'error',
            'single',
        ],
        semi: [
            'error',
            'always',
        ],
        'comma-dangle': ['error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'never',
            exports: 'never',
            functions: 'never',
        }],
        'max-len': 'off',
        'no-extend-native': 'error',
    },
    // don't look for eslintrcs above here
    root: true,
};
