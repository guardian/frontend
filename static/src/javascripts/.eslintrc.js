module.exports = {
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            extends: '@guardian/eslint-config-typescript',
            settings: {
                'import/resolver': 'webpack',
            },
        },
    ],
};
