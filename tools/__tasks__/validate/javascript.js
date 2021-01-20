const fs = require('fs');

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


const dirs = p =>
    fs.readdirSync(p).filter(f => fs.statSync(`${p}/${f}`).isDirectory());

module.exports = {
    description: 'Lint JS',
    task: [
        ...dirs('static/src/javascripts')
            .map(dir => ({
                description: `App ${chalk.dim(dir)}`,
                task: `eslint static/src/javascripts/${dir} ${config}`,
                onError: error,
            })),
        {
            description: 'Tools etc.',
            task: `eslint --ignore-pattern /static/src --ignore-pattern . ${config}`,
            onError: error,
        },
        {
            description: 'Git hooks',
            task: `eslint git-hooks/* ${config}`,
            onError: error,
        },
    ],
    concurrent: true,
};
