const path = require('path');
const fs = require('fs');

const mkdirp = require('mkdirp');
const glob = require('glob');
const SVGO = require('svgo');
const pify = require('pify');

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);
const mkdirpp = pify(mkdirp);

const { src, conf } = require('../../config').paths;

const svgo = new SVGO({
    plugins: [
        {
            removeXMLNS: true,
        },
    ],
});
const srcDir = path.resolve(src, 'inline-svgs');

module.exports = {
    description: 'Prepare inline SVGs',
    task: () => Promise.all(
        glob.sync('**/*.svg', { cwd: srcDir }).map(svgPath => {
            const dest = path.resolve(conf, 'inline-svgs', svgPath);
            return mkdirpp(path.dirname(dest))
                .then(() => readFile(path.resolve(srcDir, svgPath), 'utf-8'))
                .then(
                    fileData =>
                        new Promise(resolve => svgo.optimize(fileData, resolve))
                )
                .then(optimisedFileData =>
                    writeFile(dest, optimisedFileData.data));
        })
    ),
};
