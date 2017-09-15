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
            'https://flow.org/en/docs/editors'
        )}`
    );
};
const dirs = p =>
    fs.readdirSync(p).filter(f => fs.statSync(`${p}/${f}`).isDirectory());

module.exports = {
    description: 'Lint JS',
    task: [
        ...dirs('static/src/javascripts')
            .filter(dir => !['__flow__'].includes(dir))
            .map(dir => ({
                description: `App ${chalk.dim(dir)}`,
                task: `eslint static/src/javascripts/${dir} ${config}`,
                onError: error,
            })),
        {
            description: `App ${chalk.dim('legacy')}`,
            task: `eslint static/src/javascripts-legacy ${config}`,
            onError: error,
        },
        {
            description: 'UI',
            task: `eslint ui ${config}`,
            onError: error,
        },
        {
            description: `Tests ${chalk.dim('legacy')}`,
            task: `eslint static/test/javascripts-legacy ${config}`,
            onError: error,
        },
        {
            description: 'Tools etc.',
            task: `eslint --ignore-pattern /static/test/javascripts-legacy --ignore-pattern /static/src --ignore-pattern /ui . ${config}`,
            onError: error,
        },
        {
            description: `Flow`,
            task: () => execa('flow'),
            onError: flowError,
        },
    ],
    concurrent: true,
};
