/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const btoa = require('btoa');
const SVGO = require('svgo');
const mkdirp = require('mkdirp');
const svgo = new SVGO();

const configs = glob.sync('./*.json');

/**
 * these are the individual functions used above...
 */

const makeDest = config => new Promise((resolve, reject) => {
    fs.exists(config.cssDest, (exists) => {
        if (exists) {
            resolve();
        } else {
            mkdirp(config.cssDest, err => err ? reject(err) : resolve());
        }
    });
});

const getImages = paths => Promise.all(
    paths.map(file =>
        new Promise((resolve, reject) => {
            fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
                if (err) { reject(err); }
                svgo.optimize(data, result => {
                    resolve({
                        name: path.parse(file).name,
                        data: result
                    });
                });
            });
        })
    )
);

const generateSVGSass = (config, files) => {
    const SVGSass = files.map(file => {
        const {name, data: fileData} = file;
        return `
                %svg-i-${name},
                .svg-i-${name} {
                    background-image: url(data:image/svg+xml;base64,${btoa(fileData.data)});
                    background-position: 0 0;
                }
                .svg .i-${name} {
                    @extend %svg-i-${name} !optional;
                }
        `.replace(/ {16}/g, '');
    });
    // create svg scss file
    return new Promise((resolve, reject) => {
        fs.writeFile(
            config.cssDest + config.cssSvgName, `
                @if ($svg-support) {
                    ${SVGSass.join('').trim()}
                }
            `.trim().replace(/ {16}/g, ''),
            err => err ? reject(err) : resolve(files)
        );
    });
};

/**
 * this is the meat of what happens:
 */

configs.map(configPath => {
    console.info(`Running Spricon with ${configPath}`);

    const config = require(configPath);
    const imagePaths = glob.sync(`${config.src}/*.svg`);

    return makeDest(config)
        .then(getImages.bind(null, imagePaths))
        .then(files => generateSVGSass(config, files))
        .catch(e => console.log(e));
});
