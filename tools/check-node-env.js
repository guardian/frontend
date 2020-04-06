#!/usr/bin/env node

/* eslint-disable global-require, import/no-extraneous-dependencies */

const fs = require('fs');
const path = require('path');

const childProcess = require('child_process');

// We can't guarantee these have been installed before running this script,
// e.g. if it's the first run.
// So if they have not been installed already, quickly install them locally.
// They should be specified as a depenency, so this will almost never be a problem.
const installIfNecessary = (...packages) =>
    new Promise(resolve => {
        try {
            resolve(packages.map(require));
        } catch (e) {
            childProcess
                .spawn('npm', ['i', ...packages, '--no-save'], {
                    stdio: 'inherit',
                })
                .on('close', code => {
                    if (code !== 0) process.exit(code);
                    resolve(packages.map(require));
                });
        }
    });

installIfNecessary('semver', 'chalk').then(([semver, chalk]) => {
    let foundYarnVersion;
    let foundNodeVersion;

    const reportGoodEnv = () => {
        console.log(chalk.dim(`${chalk.green('✔')} Node ${foundNodeVersion}`));
        console.log(chalk.dim(`${chalk.green('✔')} Yarn ${foundYarnVersion}`));
    };

    // check the version of node we're in
    foundNodeVersion = process.version.match(/^v(\d+\.\d+\.\d+)/)[1];
    const nvmrcVersion = fs
        .readFileSync(path.join(__dirname, '../', '.nvmrc'), 'utf8')
        .trim();
    if (!semver.satisfies(foundNodeVersion, nvmrcVersion)) {
        console.log(`${chalk.red('✗')} Node ${foundNodeVersion}`);
        console.log(
            chalk.dim(
                `Frontend requires Node v${nvmrcVersion}.\nIf you're using NVM, you can 'nvm use'...`
            )
        );
        process.exit(1);
    }

    // We want to ensure a specific minimum version of yarn is installed.

    const enginesYarnVersion = require('../package.json').engines.yarn;
    childProcess.exec('yarn --version', (e, version) => {
        foundYarnVersion = version.trim();

        // if yarn is installed
        if (foundYarnVersion) {
            // fail if it does not satisfy engines version
            if (!semver.satisfies(foundYarnVersion, enginesYarnVersion)) {
                console.log(`${chalk.red('✗')} Yarn ${foundYarnVersion}`);
                console.log(
                    chalk.dim(
                        `Frontend requires Yarn v${enginesYarnVersion}.\nhttps://classic.yarnpkg.com/en/docs/install`
                    )
                );
                process.exit(1);
            } else {
                reportGoodEnv();
            }
            // else install yarn with npm (mainly for team city)
        } else {
            childProcess
                .spawn('npm', ['i', '-g', `yarn@${enginesYarnVersion}`], {
                    stdio: 'inherit',
                })
                .on('close', code => {
                    if (code !== 0) process.exit(code);
                    reportGoodEnv();
                });
        }
    });
});
