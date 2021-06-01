const chalk = require('chalk');

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
    description: 'Compile TS',
    task: [
        {
            description: 'Compile',
            task: `tsc --noEmit`,
            onError: error,
        },
    ],
    concurrent: true,
};
