module.exports = {
    env: {
        browser: true,
        amd: true,
        jasmine: true,
        commonjs: true,
    },
    extends: ['eslint:recommended', 'prettier'],
    parserOptions: {
        ecmaVersion: 5,
    },
    plugins: ['guardian-frontend', 'prettier'],
    rules: {
        camelcase: 'off',
        'no-shadow': 'off',
        strict: 'off',
        'no-alert': 'off',
        'no-undef': 'error',
        'no-use-before-define': ['error', 'nofunc'],
        'no-multi-spaces': 'off',
        'no-underscore-dangle': 'off',
        'key-spacing': 'off',
        'id-blacklist': ['error', 'guardian'],

        // these are bad habits in react that we're already abusing.
        // if we go more [p]react we should look at them,
        // but we don't reuse modules or develop this stuff much.
        // disabling for now.
        'react/prefer-es6-class': 'off',
        'react/no-multi-comp': 'off',
        'react/no-find-dom-node': 'off',
        'react/jsx-no-bind': 'off',
        'react/no-deprecated': 'off', // still on 0.13
        'react/prop-types': 'off',
        'react/no-string-refs': 'off',
        'react/prefer-stateless-function': 'off',
        'react/no-render-return-value': 'off',

        // disallow modules we used to use but are retiring
        'no-restricted-imports': [
            'error',
            {
                paths: ['lodash'],
                patterns: ['!lodash/*'],
            },
        ],

        // these are re-defined because this config does not extend the main one
        // which is annoying but this whole directory is not long for this world anwyay
        'no-extend-native': 'error',

        // our own rules for frontend
        // live in tools/eslint-plugin-guardian-frontend
        'guardian-frontend/global-config': 2,

        'prettier/prettier': [
            'error',
            {
                trailingComma: 'es5',
                singleQuote: true,
                bracketSpacing: true,
                tabWidth: 4,
            },
        ],
    },
    globals: {
        Promise: true,
    },
    root: true,
};
