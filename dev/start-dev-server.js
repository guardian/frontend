#!/usr/bin/env node

const path = require('path');
const webpack = require('webpack');
const chokidar = require('chokidar');
const browserSync = require('browser-sync').create();

const webpackBundler = webpack(require('../webpack.config.js')());
const bsConfig = require('./bs-config');

const src = path.join(__dirname, '../', 'static', 'src');
const sassDir = path.resolve(src, 'stylesheets');

const compileSass = require('../tools/compile-css');

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
    .on('change', () => compileSass('!(_|ie9|old-ie)*.scss'));
