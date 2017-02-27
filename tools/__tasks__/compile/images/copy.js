const path = require('path');
const cpy = require('cpy');

const { public: publicDir, target } = require('../../config').paths;

module.exports = {
    description: 'Copy images',
    task: () => cpy(['**/*'], path.resolve(target, 'images'), {
        cwd: path.resolve(publicDir, 'images'),
        parents: true,
        nodir: true,
    }),
};
