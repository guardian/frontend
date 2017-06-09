const chalk = require('chalk');
const execa = require('execa');

const config = '--quiet --color';

const error = ctx => {
    ctx.messages
        .push(`${chalk.blue('make fix')} can correct simple errors automatically.`);
    ctx.messages
        .push(`Your editor may be able to catch eslint errors as you work:\n${chalk.underline('http://eslint.org/docs/user-guide/integrations#editors')}`);
};

module.exports = {
    description: 'Lint JS',
    task: [
        {
            description: 'Lint static/test/javascripts-legacy',
            task: `eslint static/test/javascripts-legacy/**/*.js ${config}`,
            onError: error,
        },
        {
            description: 'Lint static/src',
            task: `eslint static/src/**/*.js ${config}`,
            onError: error,
        },
        {
            description: 'Lint everything else',
            task: `eslint *.js tools/**/*.js dev/**/*.js ${config}`,
            onError: error,
        },
        {
            description: 'Run Flowtype checks on static/src/javascripts/',
            task: ctx =>
                execa('npm', ['run', 'flow'].concat(['--silent']))
                    .then(res => {
                        /* We end up here, if there is a problem with the flow
                          server. The exit code would still 0, but flow logged
                          something to res.stderr. In case flow found an error
                          in the code it resolves within .catch() */
                        if (res.stderr) {
                            const err = new Error();
                            err.stderr =
                                'Apologies, flow server experienced a problem!';
                            throw err;
                        }
                    })
                    .catch(err => {
                        ctx.messages
                            .push(`Your editor may be able to catch flow errors as you work:\n${chalk.underline('https://docs.google.com/a/guardian.co.uk/document/d/1-w5KdwNVAZcGRL3Q9QCvj5y3aQyoVizm6GrHQaqQHNE/edit?usp=sharing')}`);

                        throw err;
                    }),
        },
    ],
    concurrent: true,
};
