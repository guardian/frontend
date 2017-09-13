// @flow
module.exports = {
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: '2017',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: { pragma: 'h' },
        'import/resolver': {
            webpack: {
                config: '__config__/webpack.config.js',
            },
        },
    },
    extends: [
        'plugin:flowtype/recommended',
        'prettier/flowtype',
        'prettier/react',
    ],
    plugins: ['flow-header', 'flowtype'],
    rules: {
        'flow-header/flow-header': 'error',

        // flow should take care of our return values
        'consistent-return': 'off',

        // react API stuff
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',

        // these exentions never need to be supplied for imports
        'import/extensions': [
            'error',
            'always',
            {
                js: 'never',
                jsx: 'never',
            },
        ],
    },
    globals: {
        BROWSER: true,
        SERVER: true,
    },
    env: {
        browser: true,
        nashorn: true,
    },
};
