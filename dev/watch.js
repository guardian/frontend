#!/usr/bin/env node

const path = require('path');
const browserSync = require('browser-sync').create();
const bsConfig = require('./bs-config');

const webpack = require('webpack');
const webpackBundler = webpack(require('../webpack.config.js')());

const chokidar = require('chokidar');
const ora = require('ora');

const src = path.join(__dirname, '../', 'static', 'src');
const sassDir = path.resolve(src, 'stylesheets');
const sassGraph = require('sass-graph').parseDir(sassDir, { loadPaths: sassDir });

const compileSass = require('../tools/compile-css');

let INITIAL_BUNDLE = true;

// fakes the listr steps
const wpNotification = ora({
    text: 'Create initial webpack bundles',
    color: 'yellow',
});

wpNotification.start();

webpackBundler.watch({
    ignored: /node_modules/,
}, (err, stats) => {
    if (err) {
        console.err('webpack error:', err);
    }

    if (INITIAL_BUNDLE) {
        INITIAL_BUNDLE = false;
        wpNotification.succeed();
        console.log('');
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


const releventSassFiles = /^(_|ie9|old-ie)/;
chokidar.watch(`${sassDir}/**/*.scss`)
    .on('change', (filePath) => {
        const filesToCompile = [];
        sassGraph.visitAncestors(filePath, (file) => {
            const fileName = path.basename(file);
            if (!releventSassFiles.test(fileName)) {
                filesToCompile.push(fileName);
            }
        });
        Promise.all(filesToCompile.map(compileSass))
            .then(() => {
                browserSync.sockets.emit('fullscreen:message:clear');
                browserSync.reload(filesToCompile.map(file => file.replace('scss', 'css')));
            })
            .catch((e) => {
                console.log(e.formatted);
                browserSync.sockets.emit('fullscreen:message', {
                    title: 'CSS Error:',
                    body: e.formatted,
                    timeout: 100000,
                });
            });
    });
