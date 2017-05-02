const path = require('path');

const git = require('simple-git')();
const gitUser = require('git-user-name');
const chalk = require('chalk');
const execa = require('execa');
const megalog = require('megalog');

const handleError = error => {
    console.log(chalk.red(error.stack));
    process.exit(1);
};

process.on('unhandledRejection', handleError);
process.on('uncaughtException', handleError);

const remainingModules = require('./es5to6.json');

const userModules = remainingModules[gitUser()];
if (!userModules || !userModules.length) {
    console.log(chalk.green('⭐️  You have no more modules to convert! ⭐️'));
    process.exit();
}

git
    .status((err, status) => {
        if (
            status.current !== 'master' ||
            status.files.length > 0 ||
            status.ahead !== 0 ||
            status.behind !== 0
        ) {
            console.log(
                chalk.red(
                    'Please run this in a clean, up to date copy of master.'
                )
            );
            process.exit(1);
        }
    })
    .then(() => {
        const moduleId = userModules.shift();
        const unique = `${Date.now()}`.slice(-4);
        const es5Module = path.join(
            'static',
            'src',
            'javascripts-legacy',
            moduleId
        );
        const es6Module = path.join('static', 'src', 'javascripts', moduleId);
        const es6Name = moduleId.split(path.sep).join('_').replace('.js', '');
        const branchName = `es6-${es6Name}`;

        const steps = {
            'Create a branch for the conversion': `git checkout -b "${branchName}" || git checkout -b "${branchName}-${unique}"`,
            'Move the legacy module to the new location': `mkdir -p ${path.dirname(es6Module)}; mv ${es5Module} ${path.dirname(es6Module)}; node ./tools/es5to6-remove-module.js ${moduleId}`,
            'Commit the move': `git add .; git commit --no-verify -m "move ${moduleId} from legacy to standard JS"`,
            'Convert module to ES6': `npm run -s amdtoes6 -- -d ${path.dirname(es6Module)} -o ${path.dirname(es6Module)} -g **/${path.basename(es6Module)} `,
            'Commit the module tranform': `git add .; git commit -m "transform ${moduleId} to ES6 module"`,
            'Convert contents to ES6': `npm run -s lebab -- ${es6Module}`,
            'Commit the content tranform': `git add .; git commit -m "transform ${moduleId} content to ES6"`,
            'Fix lint errors': `npm run -s eslint-fix -- ${es6Module}`,
            'Commit any lint fixes': `git add .; git commit -m "fix lint errors with ${moduleId} after transform to ES6"`,
        };

        Object.keys(steps)
            .reduce(
                (allSteps, step, i) =>
                    allSteps.then(() => {
                        console.log('');
                        console.log(chalk.blue(`${i + 1}. ${step}`));
                        console.log(chalk.dim(steps[step]));
                        return execa
                            .shell(steps[step].trim(), {
                                stdio: 'inherit',
                            })
                            .then(() => {
                                console.log(chalk.green('done'));
                            })
                            .catch(e => {
                                console.log(chalk.red(e.stack));
                                megalog.error(
                                    `\`${step}\` did not complete.

Once you have fixed the problem, you'll need to run the remaining steps manually:
${Object.keys(steps)
                                        .slice(i)
                                        .map((remaingStep, remainingCount) => `
${i + 1 + remainingCount}. ${remaingStep}
\`${steps[remaingStep]}\`
`)
                                        .join('')}
If you get stuck, feel free to ping us in https://theguardian.slack.com/messages/dotcom-platform.`
                                );
                                process.exit(1);
                            });
                    }),
                Promise.resolve()
            )
            .then(() => {
                console.log(
                    chalk.blue(
                        `\n💫  Module is now es6! Double check the code, then create a PR.`
                    )
                );
                console.log(chalk.dim(`New location: ${es6Module}\n`));
            });
    });
