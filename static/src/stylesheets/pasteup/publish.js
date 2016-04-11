// Don't run this file manually – to publish a new release run `make pasteup` from `frontend/`

var Promise = require("bluebird");
var writeFile = Promise.promisify(require("fs").writeFile);
var exec = require('child_process').exec;
var del = require('del');
var megalog = require('megalog');

var authTokenKey = 'npm.guardian.developers.authToken';

var npmCredentials = (function () {
    var propertiesFile = require('path').join(require('home-dir')(), '.gu', 'frontend.properties');
    var npmAuthToken = require('java-properties').of(propertiesFile).get(authTokenKey);
    return npmAuthToken;
})();

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
        require("inquirer").prompt([{
            type: "rawlist",
            message: "What kind of release is this?",
            name: "type",
            default: 3,
            choices: [{
                name: "Patch – it’s just small fix, nothing new",
                value: 'patch'
            },{
                name: "Minor – it adds some new, backwards-compatible stuff",
                value: 'minor'
            },{
                name: "Major – includes a breaking change",
                value: 'major'
            },{
                name: "I don’t really understand what you’re asking...",
                value: null
            }],
            validate: function(answer) {
                if (answer.length < 1) {
                    return "You must choose at least one.";
                }
                return true;
            }
        }], function (response) {
            if (response.type === null) {
                megalog.info("It is pretty straightforward, but important to get right.\n\nFor more information, see `http://semver.org`.", {heading: 'Ask a team mate for guidance'});
                process.exit(0);
            } else {
                resolve(response);
            }
        });
    });
}

function release(release) {
    release.type = 'prerelease';
    var ora = require('ora')({text: 'Publishing a new ' + release.type + ' release (while in dev) of pasteup to NPM...', spinner: 'bouncingBall'});
    ora.start();
    return new Promise(function (resolve, reject) {
        exec('npm version ' + release.type + ' && npm publish', function (e, stdout, stderr) {
            ora.stop();
            if (stderr) {
                console.error(stderr);
            }
            if (e) {
                reject(e);
            } else {
                resolve(stdout);
            }
        });
    });
}

if (typeof npmCredentials === "undefined") {
    megalog.error("You do not have the NPM credentials in your `frontend.properties`.\n\nYou cannot publish without them.");
    process.exit(1);
}

megalog.log('Updated release dependencies. \n\nPreparing a new `pasteup` release...');
setCredentials(npmCredentials)
    .then(getReleaseType)
    .then(release)
    .then(function (response) {
        megalog.log('Released a new version of `pasteup`:\n\n`' + response + '`');
        return del(['node_modules', '.npmrc']);
    })
    .catch(function (e) {
        console.error(e.stack);
        process.exit(0);
    });
