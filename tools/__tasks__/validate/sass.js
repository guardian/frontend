const execa = require('execa');

module.exports = {
    description: 'Lint Sass',
    task: ctx => execa('sass-lint', ['--verbose', '--no-exit']).then(res => {
        if (!res.stdout) {
            return ctx;
        }

        const error = new Error('sass-lint failed');
        error.stdout = res.stdout;
        throw error;
    }),
};
