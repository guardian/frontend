/* eslint-disable no-console */

const execa = require('execa');

const config = [
    '--rulesdir',
    'dev/eslint-rules',
    '--quiet',
    '--color',
    '--fix',
];

const handleSuccess = (ctx) => {
    ctx.messages.push('Don\'t forget to commit any fixes...');
};

module.exports = {
    description: 'Fix JS linting errors',
    task: [{
        description: 'Fix tests',
        task: ctx => execa('eslint', [
            'static/test/javascripts/**/*.js',
        ].concat(config)).then(handleSuccess.bind(null, ctx)),
    }, {
        description: 'Fix app',
        task: ctx => execa('eslint', [
            'static/src/**/*.js',
        ].concat(config)).then(handleSuccess.bind(null, ctx)),
    }, {
        description: 'Fix tools',
        task: ctx => execa('eslint', [
            'tools/**/*.js',
        ].concat(config)).then(handleSuccess.bind(null, ctx)),
    }],
    concurrent: true,
};
