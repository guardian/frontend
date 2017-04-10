#!/usr/bin/env node

// We use yarn to install our deps from npm.

// We want to ensure a specific minimum version of yarn is installed.
const requiredVersion = '~0.22.0';

const childProcess = require('child_process');

// The easiest way to do this cross-platform is to use the semver npm package.
// We can't guarantee it has been installed before running this script,
// e.g. if it's the first run.
// So if semver has not been installed already, quickly install it locally.
// It's specified as a depenency, so this will almost never be a problem.
new Promise(resolve => {
    try {
        require.resolve('semver');
        resolve();
    } catch (e) {
        childProcess
            .spawn('npm', ['i', 'semver'], {
                stdio: 'inherit',
            })
            .on('close', code => {
                if (code !== 0) process.exit(code);
                resolve();
            });
    }
}).then(() => {
    // we know we have semver installed
    childProcess.exec('yarn --version', (e, actualVersion) => {
        // eslint-disable-next-line global-require
        const semver = require('semver');
        if (!semver.satisfies(actualVersion, requiredVersion)) {
            childProcess
                .spawn('npm', ['i', '-g', `yarn@${requiredVersion}`], {
                    stdio: 'inherit',
                })
                .on('close', code => process.exit(code));
        }
    });
});
