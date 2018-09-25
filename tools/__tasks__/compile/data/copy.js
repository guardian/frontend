const path = require('path');
const cpy = require('cpy');

const { vendor, target } = require('../../config').paths;

module.exports = {
    description: 'Copy 3rd party Data libraries',
    task: () =>
        Promise.all([
            cpy(
                ['cmp_vendorlist.json'],
                path.resolve(target, 'data', 'vendor'),
                {
                    cwd: path.resolve(vendor, 'data'),
                    parents: true,
                    nodir: true,
                }
            ),
        ]),
};
