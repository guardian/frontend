import path from 'node:path';

import fs from 'node:fs';

import mkdirp from 'mkdirp';
import glob from 'glob';
import { optimize } from 'svgo';
import pify from 'pify';

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

import { paths } from '../.././config.mjs';

const { src, conf } = paths;

const srcDir = path.resolve(src, 'inline-svgs');

export default {
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
