var API = require('jspm');
var builder = API.Builder();
var crypto = require('crypto');

var bundlesDir = 'static/src/bundles';
var bundleConfigs = [
    ['core', 'core'],
    ['es6/bootstraps/app - core', 'es6/bootstraps/app'],
    ['bootstraps/app - core', 'bootstraps/app'],
    ['bootstraps/commercial - core', 'bootstraps/commercial'],
    ['bootstraps/sudoku - core', 'bootstraps/sudoku'],
    ['bootstraps/image-content - core', 'bootstraps/image-content'],
    ['bootstraps/facia - core', 'bootstraps/facia'],
    ['bootstraps/football - core', 'bootstraps/football'],
    ['bootstraps/preferences - core', 'bootstraps/preferences'],
    ['bootstraps/membership - core', 'bootstraps/membership'],
    ['bootstraps/ophan - core', 'bootstraps/ophan'],
    ['bootstraps/admin - core', 'bootstraps/admin'],
    ['bootstraps/video-player - core', 'bootstraps/video-player'],
    ['bootstraps/video-embed - core', 'bootstraps/video-embed'],
    ['bootstraps/dev - core', 'bootstraps/dev'],
    ['bootstraps/creatives - core', 'bootstraps/creatives']
];

var getHash = function (moduleExpression) {
    return builder.build(moduleExpression, '/dev/null')
        .then(function (output) {
            return crypto.createHash('md5')
                .update(output.source)
                .digest('hex');
        });
};

var bundle = function (moduleExpression, outFile, hash) {
    return API.bundle(moduleExpression, bundlesDir + '/' + hash + '/' + outFile + '.js', { inject: true });
};

// We have to double build as a workaround for https://github.com/jspm/jspm-cli/issues/412#issuecomment-93704188
// TODO: Promise.all
bundleConfigs.map(function (bundleConfig) {
    var moduleExpression = bundleConfig[0];
    var outFile = bundleConfig[1];
    return getHash(moduleExpression)
        .then(function (hash) {
            return bundle(moduleExpression, outFile, hash);
        })
        .catch(function (error) {
            console.error(error);
        });
});
