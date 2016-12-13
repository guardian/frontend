const execa = require('execa');

module.exports = {
    description: 'Test eslint configs',
    task: () => execa.shell('node ./dev/eslint-rules/tests/*'),
};
