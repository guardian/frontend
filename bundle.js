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

// TODO: Read from package.json
var jspmBaseUrl = 'static/src';
var prefixPath = 'static/hash';
var bundlesUri = 'bundles';
var bundleConfigs = [
    ['core', 'core.js'],
    ['es6/bootstraps/crosswords - core', 'es6/bootstraps/crosswords.js'],
    ['bootstraps/app - core', 'bootstraps/app.js'],
    ['bootstraps/commercial - core', 'bootstraps/commercial.js'],
    ['bootstraps/sudoku - core - bootstraps/app', 'bootstraps/sudoku.js'],
    ['bootstraps/image-content - core - bootstraps/app', 'bootstraps/image-content.js'],
    ['bootstraps/facia - core - bootstraps/app', 'bootstraps/facia.js'],
    ['bootstraps/football - core - bootstraps/app', 'bootstraps/football.js'],
    ['bootstraps/preferences - core - bootstraps/app', 'bootstraps/preferences.js'],
    ['bootstraps/membership - core - bootstraps/app', 'bootstraps/membership.js'],
    ['bootstraps/ophan - core', 'bootstraps/ophan.js'],
    ['bootstraps/admin - core', 'bootstraps/admin.js'],
    ['bootstraps/video-player - core', 'bootstraps/video-player.js'],
    ['bootstraps/video-embed - core', 'bootstraps/video-embed.js'],
    ['bootstraps/dev - core - bootstraps/app', 'bootstraps/dev.js'],
    ['bootstraps/creatives - core - bootstraps/app', 'bootstraps/creatives.js']
];

var getHash = function (outputSource) {
    return crypto.createHash('md5')
        .update(outputSource)
        .digest('hex');
};

var createBundle = function (bundleConfig) {
    var moduleExpression = bundleConfig[0];
    var outFile = bundleConfig[1];
    return builder.build(moduleExpression, null, {
            minify: true,
            sourceMaps: true })
        // Attach URI
        .then(function (output) {
            var hash = getHash(output.source);
            output.id = /^[^\s]*/.exec(moduleExpression)[0];
            // Relative to jspm client base URL
            output.uri = path.join(bundlesUri, hash, outFile);
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
