const path = require('path');
const fs = require('fs');

const git = require('simple-git')();
const gitUser = require('git-user-name');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const amdtoes6 = require('amd-to-es6');

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
    .then(() => {
        console.log(`1. Create module conversion branch\n - ${branchName}`);
    })
    .checkoutBranch(branchName, 'origin/master', err => {
        if (err) console.log(err);
    })
    .then(() => {
        console.log(`2. Move ${moduleId} to standard JS`);
    })
    .then(() => {
        mkdirp.sync(path.dirname(es6Module));

        fs.rename(es5Module, es6Module, err => {
            if (err) error(err);
        });
    })
    .then(() => {
        console.log(`3. Commit move`);
    })
    .add([es5Module, es6Module])
    .commit(`copy ${moduleId} from legacy to standard JS`)
    .then(() => {
        console.log('4. Convert module to es6');
        try {
            const originalSrc = fs.readFileSync(es6Module);
            const es6ModuleSrc = amdtoes6(originalSrc, {
                beautify: true,
            });
            return fs.writeFile(es6Module, es6ModuleSrc, err => {
                if (err) error(err);
            });
        } catch (e) {
            return error(e);
        }
    })
    .then(() => {
        console.log(`5. Commit conversion to es6 module`);
    })
    .add([es6Module])
    .commit(`convert ${moduleId} to an es6 module`);
