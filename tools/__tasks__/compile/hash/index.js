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

function saveAssetMap(assetFileMapping) {
    return mkdirpp(path.resolve(hash, 'assets')).then(() =>
        writeFile(path.resolve(hash, 'assets', 'assets.map'), JSON.stringify(assetFileMapping, null, 2))
    );
}

module.exports = {
    description: 'Version assets',
    task: [
        require('./clean'),
        {
            description: 'Hash assets',
            task: () => {
                const srcFiles = glob.sync('**/!(*.map)', { nodir: true, cwd: target });
                const sourceMaps = glob.sync('**/*.map', { nodir: true, cwd: target });

                const srcFileMapping = srcFiles.reduce(getSrcHash, {});
                const assetFileMapping = sourceMaps.reduce(assignSourceMap, srcFileMapping);

                return Promise.all(
                    Object.keys(assetFileMapping)
                        .map(saveHashedFile.bind(null, assetFileMapping))
                        .concat(saveAssetMap(assetFileMapping))
                );
            },
        },
    ],
};
