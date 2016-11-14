const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const {root} = require('../config').paths;

const src = path.resolve(root, 'git-hooks');
const target = path.resolve(root, '.git', 'hooks');

module.exports = {
    description: 'Update githooks',
    task: () => {

        // always try and remove any old ones
        try {
            rimraf.sync(target);
        } catch (e) { /* do nothing */ }

        // TC doesn't want them, but everyone else does
        if (process.env.TEAMCITY !== 'true') fs.symlinkSync(src, target);
        return;
    }
};
