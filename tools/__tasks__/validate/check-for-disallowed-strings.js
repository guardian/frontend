const execa = require('execa');
const chalk = require('chalk');
const { root } = require('../config').paths;
const disallowedStrings = require('../../../disallowed-strings.js');

module.exports = {
    description: 'Check for disallowed strings',
    task: ctx =>
        Promise.all(
            disallowedStrings.map(({ regex, message, maxOccurrences, paths }) =>
                execa
                    .stdout('git', [
                        'grep',
                        '-Ein',
                        '--color',
                        regex.source,
                        ...paths,
                    ])
                    .then(matches => matches.split('\n'))
                    .then(matches => {
                        if (matches.length > maxOccurrences) {
                            // console.log('bad');
                            const msg = [
                                chalk.red(
                                    `More than ${maxOccurrences} match for regex ${regex.source}`
                                ),
                                chalk.red(message),
                                ...matches,
                            ].join('\n');

                            const err = new Error();
                            err.stdout = msg;
                            throw err;
                        }
                    })
                    .catch(err => {
                        // if err code is 1, I think we're OK?
                        // otherwise it might be a real error!
                        if (
                            err.code === 1 &&
                            err.stdout === '' &&
                            err.stderr === ''
                        ) {
                            return Promise.resolve();
                        }

                        return Promise.reject(err);
                    })
            )
        ),
    concurrent: true,
};
