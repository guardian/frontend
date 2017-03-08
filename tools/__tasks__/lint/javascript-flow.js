const chalk = require('chalk');

const error = ctx => {
    ctx.messages.push(
        `Your editor may be able to catch flow errors as you work:\n${chalk.underline('https://github.com/ryyppy/flow-guide#editor-integration')}`
    );
};

module.exports = {
    description: 'Validate Flow types',
    task: [
        {
            description: 'Run Flowtype checks on static/src/javascripts/',
            task: `flow`,
            onError: error,
        },
    ],
    concurrent: true,
};
