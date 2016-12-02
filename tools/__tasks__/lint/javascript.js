/* eslint-disable no-console */

const chalk = require('chalk');

const config = '--rulesdir dev/eslint-rules --quiet --color';

const error = ctx => {
    ctx.messages.push(`${chalk.blue('make fix')} can correct simple errors automatically.`);
    ctx.messages.push(`Your editor may be able to catch eslint errors as you work:\n${chalk.underline('http://eslint.org/docs/user-guide/integrations#editors')}`);
};

module.exports = {
    description: 'Lint JS',
    task: [{
        description: 'Lint tests',
        task: 'eslint static/test/javascripts/**/*.js --ignore-path static/test/javascripts/.eslintignore ' + config,
        onError: error
    },{
        description: 'Lint app JS',
        task: 'eslint static/src/**/*.js --ignore-path static/src/.eslintignore ' + config,
        onError: error
    }],
    concurrent: true
};
