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

module.exports = {
    description: 'Version assets',
    task: [
        require('./clean'),
        {
            description: 'Hash assets',
            task: () => {
                const webpackRegex = /app-webpack/;
                const webpackChunkRegex = /chunk/;
                const sourcemapRegex = /\.map$/;

                // create the hashed asset map for all files in target
                const assetMap = glob.sync('**/!(*.map)', { nodir: true, cwd: target })
                    .reduce((map, assetPath) => {
                        const assetLocation = path.resolve(target, assetPath);
                        const hasSourceMap = fs.existsSync(`${assetLocation}.map`);

                        // webpack bundles come pre-hashed, so we won't hash them, just add them
                        if (webpackRegex.test(assetPath)) {
                            const sourcemap = hasSourceMap ? { [`${assetPath}.map`]: `${assetPath}.map` } : {};

                            return Object.assign(map, { [assetPath]: assetPath }, sourcemap);
                        }

                        // hash everything else as normal
                        const assetHash = hasha.fromFileSync(assetLocation, { algorithm: 'md5' });
                        const hashedPath = path.join(path.dirname(assetPath), assetHash, path.basename(assetPath));
                        const sourcemap = hasSourceMap ? { [`${assetPath}.map`]: `${hashedPath}.map` } : {};

                        return Object.assign(map, { [assetPath]: hashedPath }, sourcemap);
                    }, {});

                return Promise.all( // copy all the built files to their hash locations
                    Object.keys(assetMap).map(asset =>
                        cpFile(path.resolve(target, asset), path.resolve(hash, assetMap[asset]))
                    )
                ).then(() => { // add unhashed keys for any webpack boot files for use in play templates
                    const webpackBootfiles = Object.keys(assetMap).filter(key =>
                        webpackRegex.test(key) && !webpackChunkRegex.test(key) && !sourcemapRegex.test(key)
                    );

                    return Object.assign({}, assetMap, webpackBootfiles.reduce((map, webpackBootfile) =>
                        Object.assign(map, {
                            [webpackBootfile.replace(/(javascripts\/)(.+\/)/, '$1')]: assetMap[webpackBootfile],
                        }
                    ), {}));
                }).then(normalisedAssetMap => // save the asset map
                    mkdirpp(path.resolve(hash, 'assets')).then(() =>
                        writeFile(path.resolve(hash, 'assets', 'assets.map'), JSON.stringify(normalisedAssetMap, null, 4))
                    )
                );
            },
        },
    ],
};
