const path = require('path');

const cpy = require('cpy');
const execa = require('execa');

const {src, target} = require('../../config').paths;

module.exports = {
    description: 'Transpile',
    task: () => cpy(['**/*'], path.resolve(target, 'babel'), {
            cwd: path.resolve(src, 'javascripts'),
            parents: true,
            nodir: true
        }).then(() => execa('babel', [`${src}/javascripts`, '-d', `${target}/babel`, '--ignore', 'bower_components,components,vendor'], {
            env: {
                BABEL_ENV: 'production'
            }
        }))
};
