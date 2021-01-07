const execa = require('execa');

const config = ['--quiet', '--color', '--fix'];

const handleSuccess = ctx => {
    ctx.messages.push("Don't forget to commit any fixes...");
};

module.exports = {
    description: 'Fix JS linting errors',
    task: [
        {
            description: 'Fix static/src',
            task: ctx =>
                execa('eslint', ['static/src/javascripts', '--ext=ts,tsx'].concat(config)).then(
                    handleSuccess.bind(null, ctx)
                ),
        },
        {
            description: 'Fix everything else',
            task: ctx =>
                execa(
                    'eslint',
                    [
                        '*.js',
                        'tools/**/*.js',
                        'dev/**/*.js',
                        'git-hooks/*',
                    ].concat(config)
                ).then(handleSuccess.bind(null, ctx)),
        },
    ],
    concurrent: true,
};
