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
    // check the version of node we're in
    const nodeVersion = process.version.match(/^v(\d+\.\d+\.\d+)/)[1];
    const nvmrcVersion = fs
        .readFileSync(path.join(__dirname, '../', '.nvmrc'), 'utf8')
        .trim();
    if (!semver.satisfies(nodeVersion, nvmrcVersion)) {
        console.log(`${chalk.red('✗')} Node ${nodeVersion}`);
        console.log(
            chalk.dim(
                `Frontend requires Node v${nvmrcVersion} or later.\n` +
                    "If you're using NVM, you can 'nvm use'..."
            )
        );
        process.exit(1);
    }

    // We want to ensure a specific minimum version of yarn is installed.
    let foundYarnVersion;

    const enginesYarnVersion = require('../package.json').engines.yarn;
    childProcess.exec('yarn --version', (e, version) => {
        foundYarnVersion = version.trim();
        if (!semver.satisfies(foundYarnVersion, enginesYarnVersion)) {
            childProcess
                .spawn('npm', ['i', '-g', `yarn@${enginesYarnVersion}`], {
                    stdio: 'inherit',
                })
                .on('close', code => {
                    if (code !== 0) process.exit(code);
                    console.log(
                        chalk.dim(`${chalk.green('✔')} Node ${nodeVersion}`)
                    );
                    console.log(
                        chalk.dim(
                            `${chalk.green('✔')} Yarn ${foundYarnVersion}`
                        )
                    );
                });
        } else {
            console.log(chalk.dim(`${chalk.green('✔')} Node ${nodeVersion}`));
            console.log(
                chalk.dim(`${chalk.green('✔')} Yarn ${foundYarnVersion}`)
            );
        }
    });
});
