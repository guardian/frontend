const execa = require('execa');

module.exports = {
    description: 'Lint Sass',
    task: () =>
        execa('sass-lint', ['--verbose', '--no-exit']).stdout.pipe(
            process.stdout
        ),
};
