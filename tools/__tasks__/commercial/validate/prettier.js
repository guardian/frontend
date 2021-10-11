const execa = require('execa');

module.exports = {
    description: 'Run prettier on Commercial JS',
    task: 'yarn prettier -w static/src/javascripts/**/commercial/**/*.js',
}
