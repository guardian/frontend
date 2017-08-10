const path = require('path');
const cpy = require('cpy');
const { target } = require('../../config').paths;

const guuiPath = path.dirname(require.resolve('@guardian/guui'));

module.exports = {
    description: 'Copy UI',
    task: () =>
        Promise.all([
            cpy(['ui.bundle.browser.*'], path.resolve(target, 'javascripts'), {
                cwd: guuiPath,
            }),
            cpy(['ui.bundle.server.*'], path.resolve('ui', 'dist'), {
                cwd: guuiPath,
            }),
        ]),
};
