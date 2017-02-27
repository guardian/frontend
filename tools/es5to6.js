const path = require('path');
const fs = require('fs');

const git = require('simple-git')();
const gitUser = require('git-user-name');
const chalk = require('chalk');
const mkdirp = require('mkdirp');

function error(message) {
    console.log(chalk.red(message));
    process.exit(1);
}

const remainingModules = require('./es5to6.json')[gitUser()];

if (!remainingModules || !remainingModules.length) {
    console.log(chalk.green('⭐️  You have no more modules to convert! ⭐️'));
    process.exit();
}

const moduleId = remainingModules.shift();

const es5Module = path.resolve(
    __dirname,
    '..',
    'static',
    'src',
    'javascripts-legacy',
    moduleId
);

const es6Module = path.resolve(
    __dirname,
    '..',
    'static',
    'src',
    'javascripts',
    moduleId
);

const branchName = `es6-${moduleId.split(path.sep).join('_')}`;

git
    // .status((err, status) => {
    //     if (
    //         status.current !== 'master' ||
    //         status.files.length > 0 ||
    //         status.ahead !== 0 ||
    //         status.behind !== 0
    //     ) {
    //         error('Please run this from a clean, up to date copy of master.')
    //     }
    // })
    .checkoutBranch(branchName, 'origin/master', err => {
        if (err) console.log(err);
    })
    .then(() => {
        mkdirp.sync(path.dirname(es6Module));

        fs.rename(es5Module, es6Module, err => {
            if (err) error(err);
        });
    })
    .add([es5Module, es6Module])
    .commit(`copy ${moduleId} from legacy to standard JS`);
