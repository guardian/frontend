const path = require('path');
const fs = require('fs');

const mkdirp = require('mkdirp');
const glob = require('glob');
const { optimize } = require('svgo')
const pify = require('pify');

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

const { src, conf } = require('../../config').paths;

const srcDir = path.resolve(src, 'inline-svgs');

module.exports = {
    description: 'Prepare inline SVGs',
    task: () =>
        Promise.all(
            glob.sync('**/*.svg', { cwd: srcDir }).map(svgPath => {
                const dest = path.resolve(conf, 'inline-svgs', svgPath);
                return mkdirp(path.dirname(dest))
                    .then(() =>
                        readFile(path.resolve(srcDir, svgPath), 'utf-8')
                    )
                    .then(
                        fileData =>
                            new Promise(resolve =>
                                resolve(optimize(fileData, {
                                    plugins: [
                                        {
                                            name: 'preset-default',
                                            params: {
                                                overrides: {
                                                    removeViewBox: false,
                                                }
                                            }
                                        },
                                        'removeXMLNS',
                                    ],
                                })
                                )
                            )
                    )
                    .then(optimisedFileData => {
                        if (!optimisedFileData?.data) {
                            console.error('error inlining:', srcDir, svgPath);
                            return Promise.resolve();
                        }
                        return writeFile(dest, optimisedFileData.data);
                    });
            })
        ),
};
