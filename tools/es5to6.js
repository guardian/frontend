const path = require('path');
const fs = require('fs');

const git = require('simple-git')();
const gitUser = require('git-user-name');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const amdtoes6 = require('amd-to-es6');
const lebab = require('lebab');
const execa = require('execa');

process.on('uncaughtException', message => {
    console.log(chalk.red(message.stack));
    process.exit(1);
});

const remainingModules = require('./es5to6.json');

const userModules = remainingModules[gitUser()];

if (!userModules || !userModules.length) {
    console.log(chalk.green('⭐️  You have no more modules to convert! ⭐️'));
    process.exit();
}

const moduleId = userModules.shift();

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
    //         throw new Error('Please run this from a clean, up to date copy of master.')
    //     }
    // })
    .then(() => {
        if (!fs.existsSync(es5Module)) {
            console.log(
                chalk.green(
                    `${moduleId} appears to have been removed!\n\nIt has been removed from your list.`
                )
            );
            fs.writeFileSync(
                path.resolve(__dirname, 'es5to6.json'),
                JSON.stringify(remainingModules, null, 2)
            );
            git.add('./*').commit(`${moduleId} has been removed`);
            process.exit();
        }
    })
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
            if (err) throw new Error(err);
        });

        fs.writeFileSync(
            path.resolve(__dirname, 'es5to6.json'),
            JSON.stringify(remainingModules, null, 2)
        );
    })
    .then(() => {
        console.log(`3. Commit move`);
    })
    .add('./*')
    .commit(`copy ${moduleId} from legacy to standard JS`)
    .then(() => {
        console.log('4. Convert module to es6');

        const originalSrc = fs.readFileSync(es6Module);
        const unAMDd = amdtoes6(originalSrc, {
            beautify: true,
        });

        fs.writeFileSync(es6Module, unAMDd);
    })
    .then(() => {
        console.log(`5. Commit conversion to es6 module`);
    })
    .add('./*')
    .commit(`convert ${moduleId} to an es6 module`)
    .then(() => {
        console.log(`6. Convert contents to es6`);
    })
    .then(() => {
        const originalSrc = fs.readFileSync(es6Module);
        const {
            code: es6ModuleSrc,
            warnings,
        } = lebab.transform(originalSrc, [
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
            throw new Error(warnings);
        }

        fs.writeFileSync(es6Module, es6ModuleSrc);
    })
    .then(() => {
        console.log(`7. Commit conversion of content to es6`);
    })
    .add('./*')
    .commit(`convert ${moduleId} to an es6 module`)
    .then(() => {
        console.log('8. Lint the es6 module');
        return execa('eslint', [es6Module, '--color', '--fix'])
            .then(() => {
                console.log(`9. Commit lint fixes`);
                git.add('./*').commit(`lint ${moduleId}`).then(() => {
                    console.log(
                        `10. Conversion is complete – double check the code then raise a PR!`
                    );
                });
            })
            .catch(e => {
                console.log(
                    chalk.red(
                        '9. You need to fix some lint errors. Once they are sorted and commited, double check the code then raise a PR!\n\n'
                    )
                );
                console.log(e.stdout.trim());
                process.exit(1);
            });
    });
