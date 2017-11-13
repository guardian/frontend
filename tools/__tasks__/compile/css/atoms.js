const fs = require('fs');
const path = require('path');
const execa = require('execa');
const pify = require('pify');
const postcss = require('../../../postcss');
const { target } = require('../../config').paths;

const readFile = pify(fs.readFile);
const atomCssPrefix = 'atom';

module.exports = {
    description: 'Copy atom CSS to target',
    task: () =>
        execa
            .shell(
                `ls -d ${path.join(
                    'node_modules',
                    '@guardian',
                    'atom-renderer',
                    'dist'
                )}/*/`
            )
            .then(dirs => {
                const dirsArray = dirs.stdout
                    .split('\n')
                    .map(dir => dir.replace(/\/$/, ''));

                return Promise.all(
                    dirsArray.map(dir => {
                        const dirName = dir.substr(dir.lastIndexOf('/') + 1);
                        const dest = path.join(
                            target,
                            'stylesheets',
                            `${atomCssPrefix}-${dirName}-article-index.css`
                        );
                        return execa('cp', [
                            `${dir}/article/index.css`,
                            dest,
                        ]).then(() => dest);
                    })
                );
            })
            .then(dests =>
                Promise.all(dests.map(dest => readFile(dest))).then(contents =>
                    dests.map((dest, index) => ({
                        content: { css: contents[index] },
                        filePath: '',
                        dest,
                    }))
                )
            )
            .then(contents => postcss(contents, { cssvars: true })),
};
