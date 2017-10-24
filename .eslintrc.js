module.exports = {
    extends: ['airbnb', 'prettier'],
    plugins: ['guardian-frontend', 'prettier'],
    rules: {
        'import/no-extraneous-dependencies': 'off',
        // prettier settings
        'prettier/prettier': [
            'error',
            {
                trailingComma: 'es5',
                singleQuote: true,
                bracketSpacing: true,
                tabWidth: 4,
                jsxBracketSameLine: true,
                parser: 'flow',
            },
        ],
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
