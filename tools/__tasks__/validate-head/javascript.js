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
                            (file.endsWith('.js') && !file.endsWith('.scala.js')) ||
                            file.endsWith('.jsx') ||
                            file.startsWith('git-hooks')
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
                                    `✋  Your changes have not been pushed.\n${chalk.reset(
                                        `You may be able to fix things by running ${chalk.dim(
                                            'make fix-commits'
                                        )}.`
                                    )}`
                                )}`;

                                return Promise.reject(error);
                            }

                            return Promise.resolve();
                        });
                }),
        },
    ],
    concurrent: true,
};
