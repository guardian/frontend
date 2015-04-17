/*eslint-env node*/
var jspm = require('jspm');
var builder = new jspm.Builder();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

// TODO: Read from package.json
var jspmBaseUrl = 'static/src';
var bundlesDir = 'bundles';
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
            var relativeFileName = path.join(bundlesDir, hash, outFile);
            var fileName = path.join(jspmBaseUrl, relativeFileName);

            mkdirp.sync(path.dirname(fileName));
            console.log('writing to %s', fileName);
            fs.writeFileSync(fileName, output.source);
            console.log('writing to %s', fileName + '.map');
            fs.writeFileSync(fileName + '.map', output.sourceMap);

            return { relativeFileName: relativeFileName, modules: output.modules };
        });
}))
    .then(function (bundles) {
        var bundlesConfig = bundles.reduce(function (accumulator, bundle) {
            accumulator[bundle.relativeFileName.replace('.js', '')] = bundle.modules;
            return accumulator;
        }, {});
        var configFilePath = path.join(jspmBaseUrl, 'systemjs-bundle-config.js');
        var configFileData = 'System.bundles = ' + JSON.stringify(bundlesConfig, null, '\t');
        fs.writeFileSync(configFilePath, configFileData);
    })
    .catch(function (error) {
        console.error(error);
    });
