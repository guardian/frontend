const fs = require('fs');
const path = require('path');

const sass = require('node-sass');
const mkdirp = require('mkdirp');
const glob = require('glob');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const pify = require('pify');

const {src, target} = require('../../config').paths;
const sassDir = path.resolve(src, 'stylesheets');

const sassDefaults = {
    outputStyle: 'compressed',
    sourceMap: true,
    precision: 5
};

const browserslist = [
    'Firefox >= 26',
    'Explorer >= 10',
    'Safari >= 5',
    'Chrome >= 36',

    'iOS >= 5',
    'Android >= 2',
    'BlackBerry >= 6',
    'ExplorerMobile >= 7',

    '> 2% in US',
    '> 2% in AU',
    '> 2% in GB'
];

const remifications = {
    replace: true,
    root_value: 16,
    unit_precision: 5,
    prop_white_list: []
};


const sassRenderP = pify(sass.render);
const writeFileP = pify(fs.writeFile);
const getFiles = query => glob.sync(path.resolve(sassDir, query));

const compile = (query, {browsers, remify = true}) => Promise.all(
    getFiles(query).map(filePath => {
        const dest = path.resolve(target, 'stylesheets', path.relative(sassDir, filePath).replace('scss', 'css'));
        const sassOptions = Object.assign({
            file: filePath,
            outFile: dest
        }, sassDefaults);

        const postcssPlugins = [autoprefixer({browsers})];
        if (remify) {
            postcssPlugins.push(pxtorem(remifications));
        }

        mkdirp.sync(path.parse(dest).dir);
        return sassRenderP(sassOptions)
            .then(result => postcss(postcssPlugins).process(result.css.toString()))
            .then(result => writeFileP(dest, result.css));
    })
);

module.exports = {
    description: 'Compile Sass',
    task: [{
        description: 'Old IE',
        task: () => compile('old-ie.*.scss', {
            browsers: 'Explorer 8',
            remify: false
        })
    }, {
        description: 'IE9',
        task: () => compile('ie9.*.scss', {
            browsers: 'Explorer 9'
        })
    }, {
        description: 'Modern',
        task: () => compile('!(_|ie9|old-ie)*.scss', {
            browsers: browserslist
        })
    }, {
        description: 'Inline',
        task: () => compile('inline/*.scss', {
            browsers: browserslist
        })
    }],
    concurrent: true
};
