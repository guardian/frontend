// Don't run this file manually – to publish a new release run `make pasteup` from `frontend/`

/*eslint no-console: ["error", { allow: ["error"] }] */

var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var homeDir = require('home-dir');
var properties = require('java-properties');
var inquirer = require('inquirer');
var del = require('del');
var megalog = require('megalog');
var ora = require('ora');
var git = require('git-rev');
var isGitClean = require('is-git-clean');

var writeFile = Promise.promisify(fs.writeFile);
var authTokenKey = 'npm.guardian.developers.authToken';

function checkIsMasterBranch() {
    return new Promise(function (resolve, reject) {
        git.branch(function (branch) {
            if (branch === 'master') {
                resolve();
            } else {
                reject(new Error('notmaster'));
            }
        })
    });
}

function checkIsClean() {
    return isGitClean().then(function (isClean) {
        if (isClean) {
            return true;
        } else {
            throw new Error('notclean');
        }
    })
}

function getCredentials() {
    return new Promise(function (resolve, reject) {
        var propertiesFile = path.join(homeDir(), '.gu', 'frontend.properties');
        var npmAuthToken = properties.of(propertiesFile).get(authTokenKey);
        if (typeof npmAuthToken === 'undefined') {
            reject(new Error('noauth'));
        } else {
            resolve(npmAuthToken);
        }
    });
}

function setCredentials(authToken) {
    return writeFile('.npmrc', [
        'init.author.name=Guardian developers',
        'init.author.email=dotcom.engineers@theguardian.com',
        '//registry.npmjs.org/:_authToken=' + authToken,
        'registry=https://registry.npmjs.org/'
    ].join('\n'));
}

function getReleaseType() {
    return new Promise(function(resolve, reject) {
        inquirer.prompt([{
            type: 'rawlist',
            message: 'What kind of release is this?',
            name: 'type',
            default: 3,
            choices: [{
                name: 'Patch – it’s just small fix, nothing new',
                value: 'patch'
            },{
                name: 'Minor – it adds some new, backwards-compatible stuff',
                value: 'minor'
            },{
                name: 'Major – includes a breaking change',
                value: 'major'
            },{
                name: 'I don’t really understand what you’re asking...',
                value: null
            }],
            validate: function(answer) {
                if (answer.length < 1) {
                    return 'You must choose at least one.';
                }
                return true;
            }
        }], function (response) {
            if (response.type === null) {
                reject(new Error('confused'));
            } else {
                resolve(response);
            }
        });
    });
}

function release(release) {
    release.type = 'prerelease'; // hardcode release type while in dev
    var spinner = ora({text: 'Publishing a new ' + release.type + ' release (while in dev) of pasteup to NPM...', spinner: 'bouncingBall'});
    spinner.start();
    return new Promise(function (resolve, reject) {
        exec('npm version ' + release.type + ' && npm publish', function (e, stdout, stderr) {
            spinner.stop();
            if (stderr) {
                console.error(stderr);
            }
            if (e) return reject(e);
            resolve(stdout);
        });
    });
}

megalog.log([
    'Updated release dependencies.',
    'Preparing a new `pasteup` release...'
].join('\n\n'));

checkIsMasterBranch()
    .then(checkIsClean)
    .then(getCredentials)
    .then(setCredentials)
    .then(getReleaseType)
    .then(release)
    .then(function (response) {
        megalog.log([
            'Released a new version of `pasteup`:',
            '`' + response + '`'
        ].join('\n\n'));
        return del(['node_modules', '.npmrc']);
    })
    .catch(function (e) {
        switch (e.message) {
            case 'notmaster':
                megalog.error([
                    'You can only publish from the `master` branch.',
                    'Switch to master and try again: `git checkout master`.'
                ].join('\n\n'), {
                    heading: 'Incorrect branch'
                });
                break;
            case 'notclean':
                megalog.error('Commit your changes and merge a PR of them before continuing.', {
                    heading: 'You have uncommited changes'
                });
                break;
            case 'noauth':
                megalog.error([
                    'You do not have the NPM credentials in your `frontend.properties`.',
                    'You cannot publish without them.'
                ].join('\n\n'));
                break;
            case 'confused':
                megalog.info([
                    'It is pretty straightforward, but important to get right.',
                    'For more information, see `http://semver.org`.'
                ].join('\n\n'), {
                    heading: 'Ask a team mate for guidance'
                });
                break;
            default:
                console.error(e.stack);
        }
    });
