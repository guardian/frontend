module.exports = {
    ignorePatterns: ['**/*.js'],

    overrides: [
        {
            files: ['*.ts'],
            extends: '@guardian/eslint-config-typescript',    settings: {
                'import/resolver': 'webpack',
            },
        },
    ],


};
