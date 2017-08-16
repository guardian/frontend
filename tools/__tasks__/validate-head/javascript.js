const execa = require('execa');
const chalk = require('chalk');
const getChangedFiles = require('../lib/get-changed-files');

module.exports = {
    description: 'Validate committed JS',
    task: [
        {
            description: 'Lint committed JS',
            task: () =>
                getChangedFiles().then(files => {
                    const jsFiles = files.filter(
                        file =>
                            file.endsWith('.js') ||
                            file === 'git-hooks/pre-push'
                    );

                    return Promise.all(
                        jsFiles.map(filePath =>
                            execa
                                .shell(
                                    `git show HEAD:${filePath} | eslint --stdin --stdin-filename ${filePath}`
                                )
                                .catch(e => {
                                    e.stdout += `\n${chalk.red(
                                        `✋ Linting failed. You can attempt to fix lint errors by running ${chalk.underline(
                                            'make fix-commits'
                                        )}.\nYour changes have not been pushed`
                                    )}`;

                                    return Promise.reject(e);
                                })
                        )
                    );
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
                        return execa('yarn', ['flow']);
                    }

                    return Promise.resolve();
                }),
        },
    ],
    concurrent: true,
};
