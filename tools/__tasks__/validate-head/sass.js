const execa = require('execa');
const chalk = require('chalk');
const os = require('os');
const getChangedFiles = require('../lib/get-changed-files');

const getCpuCount = () => os.cpus().length;

module.exports = {
    description: 'Validate committed Sass',
    task: [
        {
            description: 'Lint committed Sass',
            task: () =>
                getChangedFiles().then(files => {
                    const errors = [];
                    const jsFiles = files.filter(file =>
                        file.endsWith('.scss')
                    );
                    const lint = (proc, batchedFiles) =>
                        proc.then(() =>
                            Promise.all(
                                batchedFiles.map(filePath =>
                                    execa
                                        .shell(
                                            `git show HEAD:${
                                                filePath
                                            } | sass-lint --no-exit --verbose --max-warnings 0 '${
                                                filePath
                                            }'`
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
                                    `✋  Your changes have not been pushed.`
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
