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

module.exports = {
    description: 'Lint JS',
    task: [
        {
            description: 'Static',
            task: `eslint static/src/javascripts --ext=ts,tsx,js ${config}`,
            onError: error,
        },
        {
            description: 'Tools etc.',
            task: `eslint tools ${config}`,
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
