module.exports = {
    parser: 'babel-eslint',
    settings: {
        'import/resolver': 'webpack',
    },
    plugins: ['guardian-frontend'],
    rules: {
        'import/no-extraneous-dependencies': 'off', // necessary while we use aliases
        'import/extensions': 'off',
        'import/no-webpack-loader-syntax': 'off', // used for require plugins still

        // these are bad habits in react that we're already abusing.
        // if we go more [p]react we should look at them.
        // not saying it's ok, but we don't reuse modules or
        // develop this stuff much. disabling for now.
        'react/prefer-es6-class': 'off',
        'react/no-multi-comp': 'off',
        'react/no-find-dom-node': 'off',
        'react/jsx-no-bind': 'off',
        'react/no-deprecated': 'off', // still on 0.13
        'react/prop-types': 'off',
        'react/no-string-refs': 'off',
        'react/prefer-stateless-function': 'off',
        'react/no-render-return-value': 'off',

        // disallow naming variables 'guardian', because
        // window.guardian is our global config/settings object
        'id-blacklist': ['error', 'guardian'],

        // disallow modules we used to use but have retired, either for
        // babel polyfills or browser natives
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    'lodash',
                    'lodash/collections/forEach',
                    'lodash/collections/map',
                    'lodash/collections/reduce',
                    'lodash/collections/some',
                    'lodash/collections/filter',
                    'lodash/objects/assign',
                    'lodash/objects/values',
                    'lodash/objects/merge',
                    'lodash/objects/keys',
                    'lodash/collections/every',
                    'lodash/collections/contains',
                    'lodash/objects/isArray',
                    'lodash/arrays/indexOf',
                    'Promise',
                ],
                patterns: ['!lodash/*'],
            },
        ],

        // our own rules for frontend
        // live in tools/eslint-plugin-guardian-frontend
        'guardian-frontend/global-config': 2,
    },
};
