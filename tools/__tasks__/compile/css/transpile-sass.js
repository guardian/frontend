const fs = require('fs');
const path = require('path');
const sass = require('node-sass');
const mkdirp = require('mkdirp');
const glob = require('glob');

const {src, target} = require('../../config').paths;
const sassDir = path.resolve(src, 'stylesheets');

const options = {
    outputStyle: 'compressed',
    sourceMap: true,
    precision: 5
};

const renderSass = (filePath, dest) => new Promise((resolve, reject) => {
    sass.render(Object.assign({
        file: filePath,
        outFile: dest
    }, options), (err, result) => {
        if (err) return reject(err);
        try {
            resolve(result.css.toString());
        } catch (e) {
            reject(e);
        }
    });
});

const saveSass = (sass, dest) => new Promise((resolve, reject) => {
    mkdirp.sync(path.parse(dest).dir);
    fs.writeFile(dest, sass, err => {
        if (err) return reject(err);
        resolve();
    });
});


function transpile (filePath) {
    const dest = path.resolve(target, 'stylesheets', path.relative(sassDir, filePath).replace('scss', 'css'));
    return renderSass(filePath, dest)
        .then(sass => saveSass(sass, dest));
}

module.exports = {
    description: 'Transpile Sass',
    task: [{
        description: 'Old IE',
        task: () => Promise.all(glob.sync(path.resolve(sassDir, 'old-ie.*.scss')).map(transpile))
    }, {
        description: 'IE9',
        task: () => Promise.all(glob.sync(path.resolve(sassDir, 'ie9.*.scss')).map(transpile))
    }, {
        description: 'Modern',
        task: () => Promise.all(glob.sync(path.resolve(sassDir, '!(_|ie9|old-ie)*.scss')).map(transpile))
    }, {
        description: 'Inline',
        task: () => Promise.all(glob.sync(path.resolve(sassDir, 'inline', '*.scss')).map(transpile))
    }],
    concurrent: true
};
