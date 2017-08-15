const execa = require('execa');
const getChangedFiles = require('../lib/get-changed-files');

module.exports = {
    description: 'Fix committed linting errors',
    task: [
        {
            description: 'Fix changed JS linting errors',
            task: () =>
                getChangedFiles().then(files => {
                    const jsFiles = files.filter(
                        file =>
                            file.endsWith('.js') ||
                            file === 'git-hooks/pre-push'
                    );
                    const config = ['--quiet', '--color', '--fix'];

                    return execa('eslint', jsFiles.concat(config));
                }),
        },
    ],
    concurrent: true,
};
