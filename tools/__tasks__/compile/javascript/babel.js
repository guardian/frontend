const execa = require('execa');

const {src, transpiled} = require('../../config').paths;

module.exports = {
    description: 'Transpile',
    task: () => execa('babel', [`${src}/javascripts`, '-d', `${transpiled}/javascripts`, '--ignore', 'bower_components/,components/,vendor/'], {
        env: {
            BABEL_ENV: 'production'
        }
    })
};
