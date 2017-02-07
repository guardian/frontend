#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const sass = require('node-sass');
const chokidar = require('chokidar');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const pxtorem = require('postcss-pxtorem');
const mkdirp = require('mkdirp');
const pify = require('pify');
const browserSync = require('browser-sync').create();

const webpackBundler = webpack(require('../webpack.config.js')());
const bsConfig = require('./bs-config');
const target = path.join(__dirname, '../', 'static', 'target');
const src = path.join(__dirname, '../', 'static', 'src');
const sassDir = path.resolve(src, 'stylesheets');
const { sassSettings, browserslist, remifications } = require('./css-settings');
const sassRenderP = pify(sass.render);
const writeFileP = pify(fs.writeFile);

let INITIAL_BUNDLE = true;

webpackBundler.watch({
    ignored: /node_modules/,
}, (err, stats) => {
    if (err) {
        console.err('webpack error:', err);
    }

    if (INITIAL_BUNDLE) {
        INITIAL_BUNDLE = false;
        browserSync.init(bsConfig);
    }

    if (stats.hasErrors() || stats.hasWarnings()) {
        return browserSync.sockets.emit('fullscreen:message', {
            title: 'Webpack Error:',
            body: stats.toString('errors-only'),
            timeout: 100000,
        });
    }
    return browserSync.reload();
});

chokidar
    .watch(`${sassDir}/**/*.scss`)
    .on('change', () => {
        const getFiles = query => glob.sync(path.resolve(sassDir, query));

        getFiles('!(_|ie9|old-ie)*.scss').map((filePath) => {
            const dest = path.resolve(target, 'stylesheets', path.relative(sassDir, filePath).replace('scss', 'css'));
            const sassOptions = Object.assign({
                file: filePath,
                outFile: dest,
            }, sassSettings);
            const postcssPlugins = [
                autoprefixer({ browsers: browserslist }),
                pxtorem(remifications)
            ];

            return sassRenderP(sassOptions)
                .then(result => postcss(postcssPlugins).process(result.css.toString()))
                .then(result => writeFileP(dest, result.css))
                .then(() => browserSync.reload('**/*.css'))
                .catch(err => {
                    browserSync.sockets.emit('fullscreen:message', {
                        title: 'Sass Error:',
                        body: err.formatted,
                        timeout: 100000,
                    });
                });
        });
    });
