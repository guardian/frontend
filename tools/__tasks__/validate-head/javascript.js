const execa = require('execa');
const chalk = require('chalk');
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

                    return execa('eslint', jsFiles.concat(config)).catch(e => {
                        e.stdout +=
                            `\n${chalk.red(
                                `✋ Linting failed. You can attempt to fix lint errors by running ${chalk.underline(
                                    'make fix-head'
                                )}.\nYour changes have not been pushed`
                            )}`;


                        return Promise.reject(e);
                    });
                }),
        },
        {
            description: 'Run Flowtype checks on static/src/javascripts/',
            task: () =>
                getChangedFiles().then(files => {
                    const jsFiles = files.filter(
                        file =>
                            file.endsWith('.js') && file.startsWith('static')
                    );

                    if (jsFiles.length) {
                        return execa('flow');
                    }

                    return Promise.resolve();
                }),
        },
    ],
    concurrent: true,
};
