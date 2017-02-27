const path = require('path');
const fs = require('fs');

const git = require('simple-git')();
const gitUser = require('git-user-name');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const amdtoes6 = require('amd-to-es6');
const lebab = require('lebab');
const execa = require('execa');

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
        console.log(`1. Create module conversion branch (${branchName})`);
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
            const originalSrc = fs.readFileSync(es5Module);
            const unAMDd = amdtoes6(originalSrc, {
                beautify: true,
            });
            const {
                code: es6ModuleSrc,
                warnings,
            } = lebab.transform(unAMDd, [
                'arrow',
                'let',
                'arg-rest',
                'arg-spread',
                'obj-method',
                'obj-shorthand',
                'no-strict',
                'class',
            ]);
            if (warnings.length) {
                error(warnings);
            }

            try {
                fs.writeFileSync(es6Module, es6ModuleSrc);
            } catch (e) {
                error(e);
            }
        } catch (e) {
            error(e);
        }
    })
    .then(() => {
        console.log(`5. Commit conversion to es6 module`);
    })
    .add([es6Module])
    .commit(`convert ${moduleId} to an es6 module`)
    .then(() => {
        console.log('6. Lint the es6 module');
        return execa('eslint', [es6Module, '--color', '--fix'])
            .then(() => {
                console.log(`7. Commit lint fixes.`);
                git
                    .add([es6Module])
                    .commit(`convert ${moduleId} contents to es6`)
                    .then(() => {
                        console.log(
                            `8. Conversion is complete. Double check the code then you can raise the PR.`
                        );
                    });
            })
            .catch(e => {
                console.log(
                    chalk.red(
                        '7. You need to fix some lint errors. Once they are sorted and commited, you can raise the PR.\n\n'
                    )
                );
                console.log(e.stdout.trim());
                process.exit(1);
            });
    });
