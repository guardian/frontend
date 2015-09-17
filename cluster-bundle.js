/*eslint-env node*/
'use strict';

var numCPUs = require('os').cpus().length;

var cluster = require('cluster');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var mkdirp = require('mkdirp');

var jspm = require('jspm');
var builder = new jspm.Builder();
// Temporary hack, as per https://github.com/systemjs/systemjs/issues/533#issuecomment-113525639
global.System = builder.loader;
// Execute the IIFE
global.systemJsRuntime = false;
require(path.join(__dirname, 'static/src/systemjs-normalize'));

var jspmBaseUrl = 'static/src';
var prefixPath = 'static/hash';
var bundlesUri = 'bundles';

var bundleConfigs = [
    ['core + system-script + domready', 'core'],
    ['es6/bootstraps/crosswords - core', 'crosswords'],
    ['bootstraps/accessibility - core - bootstraps/app - bootstraps/facia', 'accessibility'],
    ['bootstraps/app - core', 'app'],
    ['bootstraps/commercial - core', 'commercial'],
    ['bootstraps/sudoku - core - bootstraps/app', 'sudoku'],
    ['bootstraps/image-content - core - bootstraps/app', 'image-content'],
    ['bootstraps/facia - core - bootstraps/app', 'facia'],
    ['bootstraps/football - core - bootstraps/app', 'football'],
    ['bootstraps/preferences - core - bootstraps/app', 'preferences'],
    ['bootstraps/membership - core - bootstraps/app', 'membership'],
    ['bootstraps/article - core - bootstraps/app', 'article'],
    ['bootstraps/liveblog - core - bootstraps/app', 'liveblog'],
    ['bootstraps/gallery - core - bootstraps/app', 'gallery'],
    ['bootstraps/trail - core - bootstraps/app', 'trail'],
    ['bootstraps/profile - core - bootstraps/app', 'profile'],
    ['bootstraps/ophan - core', 'ophan'],
    ['bootstraps/admin - core', 'admin'],
    // Odd issue when bundling admin with core: https://github.com/jspm/jspm-cli/issues/806
    // ['bootstraps/admin', 'admin'],
    ['bootstraps/video-player - core', 'video-player'],
    ['bootstraps/video-embed - core', 'video-embed'],
    // Odd issue when bundling admin with core: https://github.com/jspm/jspm-cli/issues/806
    // ['bootstraps/video-embed', 'video-embed'],
    ['bootstraps/dev - core - bootstraps/app', 'dev'],
    ['bootstraps/creatives - core - bootstraps/app', 'creatives'],
    ['zxcvbn', 'zxcvbn']
];

var processedBundles = {};

// from http://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
function split(a, n) {
    var len = a.length,out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
    }
    return out;
}

var getHash = function (outputSource) {
    return crypto.createHash('md5')
        .update(outputSource)
        .digest('hex');
};

builder.config({
    minify: true,
    sourceMaps: true,
    sourceMapContents: true
});

function processBuild(moduleExpression, outName) {
    return function (bundle) {
        var hash = getHash(bundle.source);

        // The id is the first part of the arithmetic expression, the string up to the first space character.
        bundle.id = /^[^\s]*/.exec(moduleExpression)[0];
        // Relative to jspm client base URL
        bundle.uri = path.join(bundlesUri, outName, hash, outName + '.js');

        return bundle;
    };
}

function makeDirectory(bundle) {
    return new Promise(function (resolve, reject) {
        mkdirp(path.dirname(path.join(prefixPath, bundle.uri)), function (e) {
            if (e) return reject(e);
            resolve(bundle);
        });
    });
}

function writeBundleToDisk(bundle) {
    var bundleFileName = path.join(prefixPath, bundle.uri);

    return new Promise(function (resolve, reject) {
        console.log('writing to %s', bundleFileName);
        fs.writeFile(bundleFileName, bundle.source + '\n//# sourceMappingURL=' + path.basename(bundleFileName) + '.map', function (e) {
            if (e) return reject(e);
            resolve(bundle);
        });
    });
}

function writeBundleMapToDisk(bundle) {
    var bundleMapFileName = path.join(prefixPath, bundle.uri) + '.map';

    return new Promise(function (resolve, reject) {
        console.log('writing to %s', bundleMapFileName);
        fs.writeFile(bundleMapFileName, bundle.sourceMap, function (e) {
            if (e) return reject(e);
            resolve(bundle);
        });
    });
}

function writeConfig() {
    var bundles = Object.keys(processedBundles).map(function (key) {
        return processedBundles[key];
    });

    var configFilePath = path.join(jspmBaseUrl, 'systemjs-bundle-config.js');
    var configFileData = 'System.config({ bundles: ' + JSON.stringify(bundles, null, '\t') + ' })';

    console.log('writing to %s', configFilePath);
    fs.writeFile(configFilePath, configFileData, function (e) {
        if (e) return process.exit(1);
        process.exit(0);
    });
}

function updateBundles(message) {
    processedBundles[message.id] = message.configs;
}

function writeConfig() {
    var configs = Object.keys(processedBundles).reduce(function (acc, key) {
        var bundles = processedBundles[key];

        Object.keys(bundles).forEach(function (bundleKey) {
            acc[bundleKey] = bundles[bundleKey];
        });

        return acc;
    }, {});

    var configFilePath = path.join(jspmBaseUrl, 'systemjs-bundle-config.js');
    var configFileData = 'System.config({ bundles: ' + JSON.stringify(configs, null, '\t') + ' })';

    console.log('writing to %s', configFilePath);

    fs.writeFile(configFilePath, configFileData, function (e) {
        if (e) return process.exit(1);
        process.exit(0);
    });
}

if (cluster.isMaster) {
    var split = split(bundleConfigs, numCPUs);
    var cores = Math.min(numCPUs, split.length);

    console.log('using', cores, 'cores');

    for (var i = 0; i < cores; i++) {
        var worker = cluster.fork({ num: i });

        worker.send({ configs: split[i] });
        worker.on('message', updateBundles);
    }

    cluster.on('exit', function (worker, code) {
        if (code !== 0) return process.exit(code);

        for (var id in cluster.workers) {
            if (cluster.workers[id].isConnected()) return;
        }

        writeConfig();
    });
} else {
    process.on('message', function go(message) {
        Promise.all(message.configs.map(function (config) {
            var moduleExpression = config[0];
            var outName = config[1];

            return builder.build(moduleExpression, null)
                .then(processBuild(moduleExpression, outName))
                .then(makeDirectory)
                .then(writeBundleToDisk)
                .then(writeBundleMapToDisk);
        })).then(function (bundles) {
            var configs = bundles.reduce(function (accumulator, bundle) {
                accumulator[bundle.uri.replace('.js', '')] = [bundle.id];
                return accumulator;
            }, {});

            process.send({ id: process.env.num, configs: configs });
            process.exit(0);
        }).catch(function (err) {
            console.error(err);
            process.exit(1);
        });
    });
}
