/*eslint-env node*/

var path = require('path');

var System = require('jspm/node_modules/systemjs');
// Execute the IIFE
global.systemJsRuntime = false;
require(path.join(__dirname, 'static/src/systemjs-normalize'));
// Modify System before creating the builder because it clones System
System._extensions.push(function(loader) {
    // System.normalize is exposed by the IIFE above
    loader.normalize = System.normalize;
});

var jspm = require('jspm');
var builder = new jspm.Builder();
var crypto = require('crypto');
var fs = require('fs');
var mkdirp = require('mkdirp');
var jspmBaseUrl = 'static/src';
var prefixPath = 'static/hash';
var bundlesUri = 'bundles';
var bundleConfigs = [
    ['core + system-script', 'core'],
    ['es6/bootstraps/crosswords - core', 'crosswords'],
    ['bootstraps/accessibility - core', 'accessibility'],
    ['bootstraps/app - core', 'app'],
    ['bootstraps/commercial - core', 'commercial'],
    ['bootstraps/sudoku - core - bootstraps/app', 'sudoku'],
    ['bootstraps/image-content - core - bootstraps/app', 'image-content'],
    ['bootstraps/facia - core - bootstraps/app', 'facia'],
    ['bootstraps/football - core - bootstraps/app', 'football'],
    ['bootstraps/preferences - core - bootstraps/app', 'preferences'],
    ['bootstraps/membership - core - bootstraps/app', 'membership'],
    ['bootstraps/ophan - core', 'ophan'],
    ['bootstraps/admin - core', 'admin'],
    // Odd issue when bundling admin with core: https://github.com/jspm/jspm-cli/issues/806
    // ['bootstraps/admin', 'admin'],
    ['bootstraps/video-player - core', 'video-player'],
    ['bootstraps/video-embed - core', 'video-embed'],
    // Odd issue when bundling admin with core: https://github.com/jspm/jspm-cli/issues/806
    // ['bootstraps/video-embed', 'video-embed'],
    ['bootstraps/dev - core - bootstraps/app', 'dev'],
    ['bootstraps/creatives - core - bootstraps/app', 'creatives']
];

var getHash = function (outputSource) {
    return crypto.createHash('md5')
        .update(outputSource)
        .digest('hex');
};

var createBundle = function (bundleConfig) {
    var moduleExpression = bundleConfig[0];
    var outName = bundleConfig[1];
    return builder.build(moduleExpression, null, {
            minify: true,
            sourceMaps: true })
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
        fs.writeFileSync(bundleFileName, bundle.source);
        console.log('writing to %s', bundleMapFileName);
        fs.writeFileSync(bundleMapFileName, bundle.sourceMap);
    });
};

var writeBundlesConfig = function (bundles) {
    var bundlesConfig = bundles.reduce(function (accumulator, bundle) {
        accumulator[bundle.uri.replace('.js', '')] = [bundle.id];
        return accumulator;
    }, {});
    var configFilePath = path.join(jspmBaseUrl, 'systemjs-bundle-config.js');
    var configFileData = 'System.bundles = ' + JSON.stringify(bundlesConfig, null, '\t');
    console.log('writing to %s', configFilePath);
    fs.writeFileSync(configFilePath, configFileData);
};

Promise.all(bundleConfigs.map(createBundle))
    .then(function (bundles) {
        writeBundlesToDisk(bundles);
        writeBundlesConfig(bundles);
    })
    .catch(function (error) {
        console.error(error);
    });
