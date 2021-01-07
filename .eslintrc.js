module.exports = {
    extends: ['prettier'],
    plugins: ['guardian-frontend', 'prettier'],
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 6,
    },
    ignorePatterns: ['javascripts.flow.archive'],
};
