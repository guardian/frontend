#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

const src = path.resolve(__dirname, '..', 'git-hooks');
const target = path.resolve(__dirname, '..', '.git', 'hooks');

// always try and remove any old ones
try {
    rimraf.sync(target);
} catch (e) {
    /* do nothing */
}

// TC doesn't want them, but everyone else does
if (process.env.TEAMCITY !== 'true') fs.symlinkSync(src, target);
