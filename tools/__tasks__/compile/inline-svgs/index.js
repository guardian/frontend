const path = require('path');
const fs = require('fs');

const mkdirp = require('mkdirp');
const glob = require('glob');
const SVGO = require('svgo');
const svgo = new SVGO({
    plugins: [{
        removeXMLNS: true
    }]
});

const {src, conf} = require('../../config').paths;

const srcDir = path.resolve(src, 'inline-svgs');

const optimiseAndSave = svgPath => new Promise((resolve, reject) => {
    const svg = fs.readFileSync(path.resolve(srcDir, svgPath), 'utf-8');
    const dest = path.resolve(conf, 'inline-svgs', svgPath);

    svgo.optimize(svg, result => {
        mkdirp.sync(path.dirname(dest));
        fs.writeFile(dest, result.data, err => {
            if (err) reject(err);
            resolve();
        });
    });
});

module.exports = {
    description: 'Compile SVGs for inlining',
    task: () => {
        const optimised = glob.sync('**/*.svg', {
            cwd: srcDir
        }).map(optimiseAndSave);
        return Promise.all(optimised);
    }
};
