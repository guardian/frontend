const path = require('path');
const cpy = require('cpy');

const {src, conf} = require('../../config').paths;

module.exports = {
    description: 'Copy SVGs',
    task: () => cpy(['**/*.svg'], path.resolve(conf, 'inline-svgs'), {
        cwd: path.resolve(src, 'inline-svgs'),
        parents: true
    })
};
