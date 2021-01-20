module.exports = {
    extends: ['airbnb', 'prettier'],
    plugins: ['guardian-frontend', 'prettier'],
    rules: {
        'import/no-extraneous-dependencies': 'off',

        'no-extend-native': 'error',
        'func-style': ['error', 'expression', { allowArrowFunctions: true }],

        // our own rules for frontend
        // live in tools/eslint-plugin-guardian-frontend
        'guardian-frontend/exports-last': 'error',

        'prefer-destructuring': 'off',
    },
    // don't look for eslintrcs above here
    root: true,
};
