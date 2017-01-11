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

function getSrcHash(fileMapping, file) {
    const fileHash = hasha.fromFileSync(path.resolve(target, file), { algorithm: 'md5' });
    return Object.assign(fileMapping, {
        [file]: path.join(path.dirname(file), fileHash, path.basename(file)),
    });
}

function assignSourceMap(fileMapping, file) {
    return Object.assign(fileMapping, {
        [file]: `${fileMapping[file.replace(/\.map$/, '')]}.map`,
    });
}

function saveHashedFile(assetFileMapping, key) {
    return cpFile(path.resolve(target, key), path.resolve(hash, assetFileMapping[key]));
}

// webpack hashes its own files, and needs to know internally what those names are.
// therefore it cannot use this hashing stuff. but files need to be in the hash directory, and we need references
// to 'clean' names for them server side. this clears up the wepback key name the asset map to a normalised one
// to use in templates i.e.
// from: 'javascripts/boot-webpack.ee73f47866f7c0e802cf.js': 'javascripts/boot-webpack.ee73f47866f7c0e802cf.js'
// to:   'javascripts/boot-webpack.js': 'javascripts/boot-webpack.ee73f47866f7c0e802cf.js'
const normaliseAssetMapForWebpack = assetFileMapping => Object.keys(assetFileMapping).reduce((fileMap, key) =>
    Object.assign(fileMap, { [key.replace(/^(.+webpack)(\..+)(\.js)/, '$1$3')]: assetFileMapping[key] })
, {});

function saveAssetMap(assetFileMapping) {
    const assetMap = normaliseAssetMapForWebpack(assetFileMapping);
    return mkdirpp(path.resolve(hash, 'assets')).then(() =>
        writeFile(path.resolve(hash, 'assets', 'assets.map'), JSON.stringify(assetMap, null, 2))
    );
}

const webpackMap = webpackSrcFiles => webpackSrcFiles.reduce((wpMap, webpackSrcFile) => Object.assign(wpMap, { [webpackSrcFile]: webpackSrcFile }), {});

module.exports = {
    description: 'Version assets',
    task: [
        require('./clean'),
        {
            description: 'Hash assets',
            task: () => {
                const srcFiles = glob.sync('**/!(*.map|*webpack*)', { nodir: true, cwd: target });
                const sourceMaps = glob.sync('**/!(*webpack*)*.map', { nodir: true, cwd: target });
                const webpackSrcFiles = glob.sync('**/*webpack*', { nodir: true, cwd: target });

                const srcFileMapping = srcFiles.reduce(getSrcHash, {});
                const assetFileMapping = {};

                Object.assign(assetFileMapping, sourceMaps.reduce(assignSourceMap, srcFileMapping));
                Object.assign(assetFileMapping, webpackMap(webpackSrcFiles));

                return Promise.all(
                    Object.keys(assetFileMapping)
                        .map(saveHashedFile.bind(null, assetFileMapping))
                        .concat(saveAssetMap(assetFileMapping))
                );
            },
        },
    ],
};
