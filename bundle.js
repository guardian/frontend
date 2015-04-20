/*eslint-env node*/
var jspm = require('jspm');
var builder = new jspm.Builder();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

// TODO: Read from package.json
var jspmBaseUrl = 'static/src';
// TODO: Output to static/hash?
var prefixPath = 'static/target';
var bundlesUri = 'bundles';
var bundleConfigs = [
    ['core', 'core.js'],
    // TODO: Bundle crossword thumbnails?
    ['es6/bootstraps/crosswords - core', 'es6/bootstraps/crosswords.js'],
    ['bootstraps/app - core', 'bootstraps/app.js'],
    ['bootstraps/commercial - core', 'bootstraps/commercial.js'],
    ['bootstraps/sudoku - core', 'bootstraps/sudoku.js'],
    ['bootstraps/image-content - core', 'bootstraps/image-content.js'],
    ['bootstraps/facia - core', 'bootstraps/facia.js'],
    ['bootstraps/football - core', 'bootstraps/football.js'],
    ['bootstraps/preferences - core', 'bootstraps/preferences.js'],
    ['bootstraps/membership - core', 'bootstraps/membership.js'],
    ['bootstraps/ophan - core', 'bootstraps/ophan.js'],
    ['bootstraps/admin - core', 'bootstraps/admin.js'],
    ['bootstraps/video-player - core', 'bootstraps/video-player.js'],
    ['bootstraps/video-embed - core', 'bootstraps/video-embed.js'],
    ['bootstraps/dev - core', 'bootstraps/dev.js'],
    ['bootstraps/creatives - core', 'bootstraps/creatives.js']
];

var getHash = function (outputSource) {
    return crypto.createHash('md5')
        .update(outputSource)
        .digest('hex');
};

var createBundle = function (bundleConfig) {
    var moduleExpression = bundleConfig[0];
    var outFile = bundleConfig[1];
    return builder.build(moduleExpression, null, { sourceMaps: true })
        // Attach URI
        .then(function (output) {
            var hash = getHash(output.source);
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
        accumulator[bundle.uri.replace('.js', '')] = bundle.modules;
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
