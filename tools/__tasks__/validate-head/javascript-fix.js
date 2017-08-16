const execa = require('execa');
const getChangedFiles = require('../lib/get-changed-files');

module.exports = {
    description: 'Fix committed linting errors',
    task: () =>
        getChangedFiles().then(files => {
            const jsFiles = files.filter(
                file => file.endsWith('.js') || file === 'git-hooks/pre-push'
            );

            return execa('eslint', [...jsFiles, '--quiet', '--color', '--fix']);
        }),
};
