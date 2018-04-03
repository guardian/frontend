// @flow
module.exports = {
    env: {
        browser: true,
        jest: true,
    },
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 6,
    },
    settings: {
        'import/resolver': 'webpack',
    },
    extends: [
        'plugin:flowtype/recommended',
        'prettier/flowtype',
        'prettier/react',
    ],
    plugins: ['flowtype', 'flow-header'],
    rules: {
        // require-specific overrides
        'import/no-extraneous-dependencies': 'off', // necessary while we use aliases
        'import/extensions': 'off',
        'import/no-webpack-loader-syntax': 'off', // used for require plugins still
        'import/no-namespace': 2,
        'import/prefer-default-export': 'off', // we explicitly warn against default export below

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
        'react/jsx-indent': [2, 4],
        'react/jsx-indent-props': [2, 4],
        'react/jsx-filename-extension': 'off',

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
                    'lodash/collections/reduceRight',
                    'lodash/collections/some',
                    'lodash/collections/filter',
                    'lodash/collections/every',
                    'lodash/collections/contains',
                    'lodash/collections/find',
                    'lodash/collections/toArray',
                    'lodash/objects/assign',
                    'lodash/objects/values',
                    'lodash/objects/merge',
                    'lodash/objects/keys',
                    'lodash/objects/isArray',
                    'lodash/arrays/indexOf',
                    'lodash/arrays/compact',
                    'lodash/arrays/intersection',
                    'Promise',
                ],
                patterns: ['!lodash/*'],
            },
        ],

        'flow-header/flow-header': 'error',
        'no-param-reassign': ['error', { props: false }],
        'no-prototype-builtins': 'off',

        // our own rules for frontend
        // live in tools/eslint-plugin-guardian-frontend
        'guardian-frontend/global-config': 'error',
        'guardian-frontend/no-multiple-classlist-parameters': 'error',
        'guardian-frontend/no-default-export': 'warn',
        'guardian-frontend/no-direct-access-config': 'warn',

        // flow should take care of our return values
        'consistent-return': 'off',
    },
};
