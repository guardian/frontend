const execa = require('execa');
const getChangedFiles = require('../lib/get-changed-files');

module.exports = {
    description: 'Lint changed JS',
    task: [
        {
            description: 'Lint changed JS',
            task: () =>
                getChangedFiles().then(files => {
                    const jsFiles = files.filter(
                        file =>
                            file.endsWith('.js') ||
                            file === 'git-hooks/pre-push'
                    );
                    const config = ['--quiet', '--color'];

                    return execa('eslint', jsFiles.concat(config));
                }),
        },
    ],
    concurrent: true,
};
