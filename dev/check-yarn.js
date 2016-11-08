#!/usr/bin/env node

const childProcess = require('child_process');

// given we could have no local app-wide node_modules yet,
// it uses locally installed, checked-in deps...

const semver = require('semver');

const requiredVersion = '>=0.16.0';

childProcess.exec('yarn --version', (error, actualVersion, stderr) => {
    if (error || stderr || !semver.satisfies(actualVersion, requiredVersion)) {
        if (actualVersion) {
            console.log(`Updating yarn to ${requiredVersion}...`);
        } else {
            console.log('Installing yarn...');
        }
        childProcess.spawn('npm', ['i', '-g', `yarn@${requiredVersion}`], {
            stdio: 'inherit'
        });
    }
});
