const execa = require('execa');
const chalk = require('chalk');
const os = require('os');
const getChangedFiles = require('../lib/get-changed-files');

const getCpuCount = () => os.cpus().length;

module.exports = {
    description: 'Validate committed JS',
    task: [
        {
            description: 'Lint committed JS',
            task: () =>
                getChangedFiles().then(files => {
                    const errors = [];
                    const jsFiles = files.filter(
                        file =>
                            file.endsWith('.js') ||
                            file === 'git-hooks/pre-push' ||
                            file === 'git-hooks/post-merge'
                    );
                    const lint = (proc, batchedFiles) =>
                        proc.then(() =>
                            Promise.all(
                                batchedFiles.map(filePath =>
                                    execa
                                        .shell(
                                            `git show HEAD:${filePath} | eslint --stdin --stdin-filename ${filePath}`
                                        )
                                        .catch(e => {
                                            errors.push(e);
                                        })
                                )
                            )
                        );
                    const batch = (arr, batchSize) => {
                        const batchFold = (xss, x) => {
                            if (!xss.length) {
                                return [[x]];
                            }
                            if (xss[0].length < batchSize) {
                                return [xss[0].concat(x), ...xss.slice(1)];
                            }

                            return [[x], ...xss];
                        };

                        return arr.reduce(batchFold, []);
                    };

                    return batch(jsFiles, getCpuCount())
                        .reduce(lint, Promise.resolve())
                        .then(() => {
                            if (errors.length) {
                                const error = errors.reduce(
                                    (acc, curr) => {
                                        acc.stdout += curr.stdout;

                                        return acc;
                                    },
                                    { stdout: '' }
                                );

                                error.stdout += `\n${chalk.red(
                                    `✋ Linting failed. You can attempt to fix lint errors by running ${chalk.underline(
                                        'make fix-commits'
                                    )}.\nYour changes have not been pushed`
                                )}`;

                                return Promise.reject(error);
                            }

                            return Promise.resolve();
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
                        return execa('yarn', ['flow']);
                    }

                    return Promise.resolve();
                }),
        },
    ],
    concurrent: true,
};
