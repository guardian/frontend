const fs = require('fs');

const chalk = require('chalk');
const execa = require('execa');

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
const dirs = p =>
    fs.readdirSync(p).filter(f => fs.statSync(`${p}/${f}`).isDirectory());

module.exports = {
    description: 'Lint JS',
    task: [
        {
            description: 'Lint legacy tests',
            task: `eslint static/test/javascripts-legacy ${config}`,
            onError: error,
        },
        ...dirs('static/src/javascripts').map(dir => ({
            description: `Lint app ${chalk.dim(dir)}`,
            task: `eslint static/src/javascripts/${dir} ${config}`,
            onError: error,
        })),
        {
            description: `Lint app ${chalk.dim('legacy')}`,
            task: `eslint static/src/javascripts-legacy ${config}`,
            onError: error,
        },
        {
            description: 'Lint guui',
            task: `eslint ui ${config}`,
            onError: error,
        },
        {
            description: 'Lint tools etc.',
            task: `eslint --ignore-pattern /static/test/javascripts-legacy --ignore-pattern /static/src --ignore-pattern /ui . ${config}`,
            onError: error,
        },
        {
            description: `Flow ${chalk.dim('app')}`,
            task: () => execa('flow', { cwd: 'static/src/javascripts' }),
            onError: flowError,
        },
    ],
    concurrent: true,
};
