/*eslint-env node*/
'use strict';

var numCPUs = require('os').cpus().length;

var cluster = require('cluster');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var mkdirp = require('mkdirp');
var _ = require('lodash');

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
    ['bootstraps/media - core', 'media'],
    ['bootstraps/video-embed - core', 'video-embed'],
    // Odd issue when bundling admin with core: https://github.com/jspm/jspm-cli/issues/806
    // ['bootstraps/video-embed', 'video-embed'],
    ['bootstraps/dev - core - bootstraps/app', 'dev'],
    ['bootstraps/creatives - core - bootstraps/app', 'creatives'],
    ['zxcvbn', 'zxcvbn']
];

var processedBundles = {};

var bundleOptions = {
    minify: true,
    sourceMaps: true,
    sourceMapContents: true
};

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

function makeDirectory(dirPath) {
    return new Promise(function (resolve, reject) {
        mkdirp(dirPath, function (e) {
            if (e) return reject(e);
            resolve();
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

function updateBundles(message) {
    processedBundles[message.id] = message.configs;
}

function writeConfig() {
    var configs = _(processedBundles)
        .values()
        .reduce(function (accumulator, object) { return _.merge(accumulator, object); });

    var configFilePath = path.join(prefixPath, 'assets/jspm-assets.map');
    var configFileData = JSON.stringify(configs, null, '\t');

    console.log('writing to %s', configFilePath);

    return makeDirectory(path.dirname(configFilePath)).then(function () {
        return new Promise(function (resolve, reject) {
            fs.writeFile(configFilePath, configFileData, function (e) {
                if (e) {
                    reject(e);
                } else {
                    resolve();
                }
            });
        });
    });
}

var createModuleExpressionToFilenameMap = function (bundles) {
    return Promise.all(bundles.map(function (bundle) {
        return System.normalize(bundle.id).then(function (absolutePath) {
            absolutePath = absolutePath.replace('file://', '');
            var pathRelativeToDir = path.relative(__dirname, absolutePath);
            return path.relative(jspmBaseUrl, pathRelativeToDir);
        }).then(function (relativeFilename) {
            return {
                expression: bundle.id,
                relativeFilename: relativeFilename
            };
        });
    })).then(function (modules) {
        return modules.reduce(function (accumulator, module) {
            accumulator[module.expression] = module.relativeFilename;
            return accumulator;
        }, {});
    });
};

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

        writeConfig().catch(function (err) {
            console.error(err.stack);
            process.exit(1);
        });
    });
} else {
    process.on('message', function go(message) {
        Promise.all(message.configs.map(function (config) {
            var moduleExpression = config[0];
            var outName = config[1];

            return builder.bundle(moduleExpression, null, bundleOptions)
                .then(processBuild(moduleExpression, outName))
                .then(function (bundle) {
                    return makeDirectory(path.dirname(path.join(prefixPath, bundle.uri)))
                        .then(function () { return bundle; });
                })
                .then(writeBundleToDisk)
                .then(writeBundleMapToDisk);
        })).then(function (bundles) {
            return createModuleExpressionToFilenameMap(bundles).then(function (map) {
                var configs = bundles.reduce(function (accumulator, bundle) {
                    accumulator[map[bundle.id]] = bundle.uri;
                    return accumulator;
                }, {});

                process.send({ id: process.env.num, configs: configs });
                process.exit(0);
            });
        }).catch(function (err) {
            console.error(err.stack);
            process.exit(1);
        });
    });
}
