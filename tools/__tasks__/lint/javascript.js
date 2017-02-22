const chalk = require('chalk');

const config = '--quiet --color';

const error = (ctx) => {
    ctx.messages.push(`${chalk.blue('make fix')} can correct simple errors automatically.`);
    ctx.messages.push(`Your editor may be able to catch eslint errors as you work:\n${chalk.underline('http://eslint.org/docs/user-guide/integrations#editors')}`);
};

module.exports = {
    description: 'Lint JS',
    task: [{
        description: 'Lint static/test/javascript-legacy',
        task: `eslint static/test/javascripts-legacy/**/*.js ${config}`,
        onError: error,
    }, {
        description: 'Lint static/src',
        task: `eslint static/src/**/*.js ${config}`,
        onError: error,
    }, {
        description: 'Lint everything else',
        task: `eslint *.js tools/**/*.js dev/**/*.js ${config}`,
        onError: error,
    }],
    concurrent: true,
};
