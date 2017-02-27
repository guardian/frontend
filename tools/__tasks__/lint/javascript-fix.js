const execa = require('execa');

const config = ['--quiet', '--color', '--fix'];

const handleSuccess = ctx => {
    ctx.messages.push("Don't forget to commit any fixes...");
};

module.exports = {
    description: 'Fix JS linting errors',
    task: [
        {
            description: 'Fix static/tests/javascripts-legacy',
            task: ctx =>
                execa(
                    'eslint',
                    ['static/test/javascripts-legacy/**/*.js'].concat(config)
                ).then(handleSuccess.bind(null, ctx)),
        },
        {
            description: 'Fix static/src',
            task: ctx =>
                execa('eslint', ['static/src/**/*.js'].concat(config)).then(
                    handleSuccess.bind(null, ctx)
                ),
        },
        {
            description: 'Fix everything else',
            task: ctx =>
                execa(
                    'eslint',
                    ['*.js', 'tools/**/*.js', 'dev/**/*.js'].concat(config)
                ).then(handleSuccess.bind(null, ctx)),
        },
    ],
    concurrent: true,
};
