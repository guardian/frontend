const chalk = require('chalk');

const config = '--quiet --color';

const error = ctx => {
    ctx.messages.push(
        `${chalk.blue('make fix')} can correct simple errors automatically.`
    );
    ctx.messages.push(
        `Your editor may be able to catch eslint errors as you work:\n${chalk.underline(
            'http://eslint.org/docs/user-guide/integrations#editors'
        )}`
    );
};

const flowError = ctx => {
    ctx.messages.push(
        `Your editor may be able to catch flow errors as you work:\n${chalk.underline(
            'https://docs.google.com/a/guardian.co.uk/document/d/1-w5KdwNVAZcGRL3Q9QCvj5y3aQyoVizm6GrHQaqQHNE/edit?usp=sharing'
        )}`
    );
};

module.exports = {
    description: 'Lint JS',
    task: [
        {
            description: 'Lint static/test/javascripts-legacy',
            task: `eslint static/test/javascripts-legacy/**/*.js ${config}`,
            onError: error,
        },
        {
            description: 'Lint static/src',
            task: `eslint static/src/**/*.js ${config}`,
            onError: error,
        },
        {
            description: 'Lint everything else',
            task: `eslint *.js tools/**/*.js dev/**/*.js ${config}`,
            onError: error,
        },
        {
            description: 'Run Flowtype checks on static/src/javascripts/',
            task: `flow`,
            onError: flowError,
        },
    ],
    concurrent: true,
};
