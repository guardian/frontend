// unified CSS creation module. used for prod and dev/watch tasks.
// writes files to `static/target/stylesheets` i.e. has side-effects
// exports a function which takes:
// 1. glob for files in static/src/stylesheets
// 2. options object offering `remify` (boolean) and `browsers` (browserlist)

const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');
const glob = require('glob');
const pify = require('pify');

const sass = require('node-sass');

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');

const sassRenderP = pify(sass.render);
const writeFileP = pify(fs.writeFile);

const { src, target } = require('./__tasks__/config').paths;

const sassDir = path.resolve(src, 'stylesheets');

const SASS_SETTINGS = {
    outputStyle: 'compressed',
    sourceMap: true,
    precision: 5,
};

const BROWSERS_LIST = [
    'Firefox >= 45',
    'Explorer >= 10',
    'Safari >= 7',
    'Chrome >= 50',

    'iOS >= 7',
    'Android >= 5',
    'BlackBerry >= 10',
    'ExplorerMobile >= 10',

    '> 2% in US',
    '> 2% in AU',
    '> 2% in GB',
];

const REMIFICATIONS = {
    replace: true,
    root_value: 16,
    unit_precision: 5,
    propList: ['*'],
};

const getFiles = sassGlob => glob.sync(path.resolve(sassDir, sassGlob));

module.exports = (
    sassGlob,
    { remify = true, browsers = BROWSERS_LIST } = {}
) => {
    if (typeof sassGlob !== 'string') {
        return Promise.reject(new Error('No glob provided.'));
    }

    return Promise.all(
        getFiles(sassGlob).map(filePath => {
            const dest = path.resolve(
                target,
                'stylesheets',
                path.relative(sassDir, filePath).replace('scss', 'css')
            );
            const sassOptions = Object.assign(
                {
                    file: filePath,
                    outFile: dest,
                    sourceMapContents: true,
                    includePaths: ['node_modules'],
                },
                SASS_SETTINGS
            );

            const postcssPlugins = [autoprefixer({ overrideBrowserslist: browsers })];
            if (remify) {
                postcssPlugins.push(pxtorem(REMIFICATIONS));
            }

            mkdirp.sync(path.parse(dest).dir);
            return sassRenderP(sassOptions)
                .then(result =>
                    postcss(postcssPlugins).process(result.css.toString(), {
                        from: filePath,
                        to: dest,
                        map: {
                            inline: false,
                            prev: result.map.toString(),
                        },
                    })
                )
                .then(result =>
                    Promise.all([
                        writeFileP(dest, result.css.toString()),
                        writeFileP(`${dest}.map`, result.map.toString()),
                    ])
                );
        })
    );
};
