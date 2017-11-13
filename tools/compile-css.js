// unified CSS creation module. used for prod and dev/watch tasks.
// writes files to `static/target/stylesheets` i.e. has side-effects
// exports a function which takes:
// 1. glob for files in static/src/stylesheets
// 2. options object offering `remify` (boolean) and `browsers` (browserlist)

const path = require('path');

const mkdirp = require('mkdirp');
const glob = require('glob');
const pify = require('pify');

const sass = require('node-sass');

const sassRenderP = pify(sass.render);

const { src, target } = require('./__tasks__/config').paths;

const sassDir = path.resolve(src, 'stylesheets');

const SASS_SETTINGS = {
    outputStyle: 'compressed',
    sourceMap: true,
    precision: 5,
};

const getFiles = sassGlob => glob.sync(path.resolve(sassDir, sassGlob));

module.exports = sassGlob => {
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

            mkdirp.sync(path.parse(dest).dir);
            return sassRenderP(sassOptions).then(result => ({
                content: result,
                filePath,
                dest,
            }));
        })
    );
};
