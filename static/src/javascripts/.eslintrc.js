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
        'prettier/react',
    ],
    rules: {
        // require-specific overrides
        'import/extensions': 'off',
        'import/no-webpack-loader-syntax': 'off', // used for require plugins still
        'import/no-namespace': 2,
        'import/prefer-default-export': 'off', // we explicitly warn against default export below

        // these are bad habits in react that we're already abusing.
        // if we go more [p]react we should look at them.
        // not saying it's ok, but we don't reuse modules or
        // develop this stuff much. disabling for now.
        'react/no-multi-comp': 'off',
        'react/no-find-dom-node': 'off',
        'react/jsx-no-bind': 'off',
        'react/prefer-stateless-function': 'off',
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
                    'lodash/forEach',
                    'lodash/map',
                    'lodash/reduce',
                    'lodash/reduceRight',
                    'lodash/some',
                    'lodash/filter',
                    'lodash/every',
                    'lodash/contains',
                    'lodash/find',
                    'lodash/toArray',
                    'lodash/assign',
                    'lodash/values',
                    'lodash/merge',
                    'lodash/keys',
                    'lodash/isArray',
                    'lodash/indexOf',
                    'lodash/compact',
                    'lodash/intersection',
                    'Promise',
                ],
                patterns: ['!lodash/*'],
            },
        ],

        'no-param-reassign': ['error', { props: false }],
        'no-prototype-builtins': 'off',

        // our own rules for frontend
        // live in tools/eslint-plugin-guardian-frontend
        'guardian-frontend/global-config': 'error',
        'guardian-frontend/no-multiple-classlist-parameters': 'error',
        'guardian-frontend/no-default-export': 'warn',
        'guardian-frontend/no-direct-access-config': 'warn',

        // flow (used to) take care of this stuff (although, did it really?)
        // it will be managed by TS in the future
        'consistent-return': 'off',
        'react/prop-types': 'off',
    }
};
