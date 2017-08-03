const execa = require('execa');

module.exports = {
    description: 'Compile UI',
    task: () => execa('make', ['ui-compile']),
};
