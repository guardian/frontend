module.exports = {
    settings: {
        'import/resolver': 'webpack',
    },
    plugins: ['guardian-frontend', 'flowtype'],
    rules: {
        // require-specific overrides
        'import/no-dynamic-require': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/extensions': 'off',
        'import/no-webpack-loader-syntax': 'off', // used for require plugins still
        'import/no-amd': 'off', // webpack dynamic requires
        'global-require': 'off',
        'id-blacklist': ['error', 'guardian'],

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

        // disallow modules we used to use but are retiring
        'no-restricted-imports': [
            'error',
            {
                paths: ['lodash'],
                patterns: ['!lodash/*'],
            },
        ],

        // our own rules for frontend
        // live in tools/eslint-plugin-guardian-frontend
        'guardian-frontend/global-config': 2,

        // Turn on flowtype
        'flowtype/define-flow-type': 1,
    },
};
