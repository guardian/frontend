const path = require('path');
const fs = require('fs');

const glob = require('glob');
const hasha = require('hasha');
const cpFile = require('cp-file');
const mkdirp = require('mkdirp');
const pify = require('pify');

const writeFile = pify(fs.writeFile);
const mkdirpp = pify(mkdirp);

const { hash, target } = require('../../config').paths;

const standardAssetsMap = () => {
    const assets = glob.sync('**/!(*.map|*grauniapp*.js)', { nodir: true, cwd: target });
    return assets.reduce((assetMap, asset) => {
        const assetHash = hasha.fromFileSync(path.resolve(target, asset), { algorithm: 'md5' });
        return Object.assign(assetMap, {
            [asset]: path.join(path.dirname(asset), assetHash, path.basename(asset)),
        });
    }, {});
};

const sourceMapAssetsMap = (assetMap) => {
    const sourceMaps = glob.sync('**/!(*grauniapp*)*.map', { nodir: true, cwd: target });
    return sourceMaps.reduce((sourceMapMap, sourceMap) => Object.assign(sourceMapMap, {
        [sourceMap]: `${assetMap[sourceMap.replace(/\.map$/, '')]}.map`,
    }), {});
};

const webpackAssetsMap = () => {
    const webpackAssets = glob.sync('**/*grauniapp*.js', { nodir: true, cwd: target });
    return webpackAssets.reduce((assetMap, webpackAsset) => Object.assign(assetMap, {
        [webpackAsset]: webpackAsset,
    }), {});
};

function createHashedAsset(assetMap, asset) {
    return cpFile(path.resolve(target, asset), path.resolve(hash, assetMap[asset]));
}

const normaliseAssetMapForWebpack = assetMap =>
    // Webpack hashes its own files, and needs to know internally what those names are.
    // However, although we don't hash webpack files, they need to be in the hash directory
    // and in the asset map so we can get at them server side.
    // They're added to the map and copied, but since they're already hashed by webpack,
    // we need to normalise the wepback asset name of the entry file to a 'clean' one
    // for use in templates so that:
    //     'javascripts/grauniapp.abc123.js': 'javascripts/grauniapp.abc123.js'
    // becomes:
    //     'javascripts/grauniapp.js': 'javascripts/grauniapp.abc123.js'
    Object.keys(assetMap).reduce((normalisedAssetMap, asset) =>
        Object.assign(normalisedAssetMap, { [asset.replace(/(\/grauniapp)(\..+)(\.js)/, '$1$3')]: assetMap[asset] })
    , {});

function saveAssetMap(assetMap) {
    return mkdirpp(path.resolve(hash, 'assets')).then(() =>
        writeFile(path.resolve(hash, 'assets', 'assets.map'), JSON.stringify(assetMap, null, 2))
    );
}

module.exports = {
    description: 'Version assets',
    task: [
        require('./clean'),
        {
            description: 'Hash assets',
            task: () => {
                const assetMap = Object.assign(standardAssetsMap(), webpackAssetsMap());
                Object.assign(assetMap, sourceMapAssetsMap(assetMap));

                return Promise.all(
                    Object.keys(assetMap)
                        .map(createHashedAsset.bind(null, assetMap))
                        .concat(saveAssetMap(normaliseAssetMapForWebpack(assetMap)))
                );
            },
        },
    ],
};
