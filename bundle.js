/*eslint-env node*/
'use strict';

var path = require('path');

var jspm = require('jspm');
var builder = new jspm.Builder();
// Temporary hack, as per https://github.com/systemjs/systemjs/issues/533#issuecomment-113525639
global.System = builder.loader;
// Execute the IIFE
global.systemJsRuntime = false;
require(path.join(__dirname, 'static/src/systemjs-normalize'));

var crypto = require('crypto');
var fs = require('fs');
var mkdirp = require('mkdirp');
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

var getHash = function (outputSource) {
    return crypto.createHash('md5')
        .update(outputSource)
        .digest('hex');
};

var createBundle = function (bundleConfig) {
    var moduleExpression = bundleConfig[0];
    var outName = bundleConfig[1];
    return builder.bundle(moduleExpression, null, {
            minify: true,
            sourceMaps: true,
            sourceMapContents: true })
        // Attach URI
        .then(function (output) {
            var hash = getHash(output.source);
            // The id is the first part of the arithmetic expression, the string up to the first space character.
            output.id = /^[^\s]*/.exec(moduleExpression)[0];
            // Relative to jspm client base URL
            output.uri = path.join(bundlesUri, outName, hash, outName + '.js');
            return output;
        });
};

var writeBundlesToDisk = function (bundles) {
    bundles.forEach(function (bundle) {
        var bundleFileName = path.join(prefixPath, bundle.uri);
        var bundleMapFileName = bundleFileName + '.map';

        mkdirp.sync(path.dirname(bundleFileName));

        console.log('writing to %s', bundleFileName);
        fs.writeFileSync(bundleFileName, bundle.source + '\n//# sourceMappingURL=' + path.basename(bundleFileName) + '.map');
        console.log('writing to %s', bundleMapFileName);
        fs.writeFileSync(bundleMapFileName, bundle.sourceMap);
    });
};

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

var writeBundlesConfig = function (bundles) {
    return createModuleExpressionToFilenameMap(bundles).then(function (map) {
        var bundlesConfig = bundles.reduce(function (accumulator, bundle) {
            accumulator[map[bundle.id]] = bundle.uri;
            return accumulator;
        }, {});
        var filePath = path.join(prefixPath, 'assets/jspm-assets.map');
        var fileData = JSON.stringify(bundlesConfig, null, '\t');

        mkdirp.sync(path.dirname(filePath));

        console.log('writing to %s', filePath);
        fs.writeFileSync(filePath, fileData);
    });
};

Promise.all(bundleConfigs.map(createBundle))
    .then(function (bundles) {
        writeBundlesToDisk(bundles);
        return writeBundlesConfig(bundles);
    })
    .catch(function (error) {
        console.error(error.stack);
        process.exit(1);
    });
