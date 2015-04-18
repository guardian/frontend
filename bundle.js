/*eslint-env node*/
var jspm = require('jspm');
var builder = new jspm.Builder();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

// TODO: Read from package.json
var jspmBaseUrl = 'static/src';
var prefixPath = 'static/target';
var bundlesUri = 'bundles';
var bundleConfigs = [
    ['core', 'core.js'],
    ['es6/bootstraps/app - core', 'es6/bootstraps/app.js'],
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

Promise.all(bundleConfigs.map(function (bundleConfig) {
    var moduleExpression = bundleConfig[0];
    var outFile = bundleConfig[1];
    return builder.build(moduleExpression, null, { sourceMaps: true })
        .then(function (output) {
            var hash = getHash(output.source);
            // Relative to jspm client base URL
            var bundleUri = path.join(bundlesUri, hash, outFile);
            var bundleFileName = path.join(prefixPath, bundleUri);
            var bundleMapFileName = bundleFileName + '.map';

            mkdirp.sync(path.dirname(bundleFileName));
            console.log('writing to %s', bundleFileName);
            fs.writeFileSync(bundleFileName, output.source);
            console.log('writing to %s', bundleMapFileName);
            fs.writeFileSync(bundleMapFileName, output.sourceMap);

            return { bundleUri: bundleUri, modules: output.modules };
        });
}))
    .then(function (bundles) {
        var bundlesConfig = bundles.reduce(function (accumulator, bundle) {
            accumulator[bundle.bundleUri.replace('.js', '')] = bundle.modules;
            return accumulator;
        }, {});
        var configFilePath = path.join(jspmBaseUrl, 'systemjs-bundle-config.js');
        var configFileData = 'System.bundles = ' + JSON.stringify(bundlesConfig, null, '\t');
        fs.writeFileSync(configFilePath, configFileData);
    })
    .catch(function (error) {
        console.error(error);
    });
