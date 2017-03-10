const execa = require('execa');

const { src, transpiled } = require('../../config').paths;

module.exports = {
    description: 'Transpile',
    task: () =>
        execa(
            'babel',
            [
                `${src}/javascripts`,
                '--out-dir',
                `${transpiled}/javascripts`,
                '--ignore',
                '**/*.spec.js',
            ],
            {
                env: {
                    BABEL_ENV: 'karma',
                },
            }
        ),
};
