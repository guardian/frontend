/* eslint-disable no-console */

const execa = require('execa');
const chalk = require('chalk');

const config = [
    '--rulesdir',
    'dev/eslint-rules',
    '--quiet',
    '--color'
];

const handleFailure = (ctx, e) => {
    ctx.messages.push(`${chalk.blue('make fix')} can correct simple errors automatically.`);
    ctx.messages.push(`Your editor may be able to catch eslint errors as you work:\n${chalk.underline('http://eslint.org/docs/user-guide/integrations#editors')}`);
    return Promise.reject(e);
};

module.exports = {
    description: 'Lint JS',
    task: [{
        description: 'Lint tests',
        task: ctx => execa.stdout('eslint', [
            'static/test/javascripts/**/*.js',
            '--ignore-path',
            'static/test/javascripts/.eslintignore'
        ].concat(config)).catch(handleFailure.bind(null, ctx))
    },{
        description: 'Lint app JS',
        task: ctx => execa.stdout('eslint', [
            'static/src/**/*.js',
            '--ignore-path',
            'static/src/.eslintignore'
        ].concat(config)).catch(handleFailure.bind(null, ctx))
    }],
    concurrent: true
};
