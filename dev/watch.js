#!/usr/bin/env node

const path = require('path');

const chalk = require('chalk');
const browserSync = require('browser-sync').create();
const bsConfig = require('./bs-config');

// ********************************** JAVASCRIPT **********************************

// webpack watch task always performs an intial bundle, and we don't want browsersync
// listening at the point. so we use this flag to know whether any change webpack reports
// is the initial bundle, or subsequent file changes
let INITIAL_BUNDLE = true;

// just a bit of visual feedback while webpack creates its initial bundles.
// fakes a listr step
const ora = require('ora');

const wpNotification = ora({
    text: 'Create initial webpack bundles',
    color: 'yellow',
});
wpNotification.start();

const webpack = require('webpack');
const webpackBundler = webpack(require('../webpack.config.dev.js'));

webpackBundler.watch(
    {
        ignored: /node_modules/,
    },
    (err, stats) => {
        if (err) {
            // log any unexpected error
            console.log(chalk.red(err));
        }

        if (INITIAL_BUNDLE) {
            INITIAL_BUNDLE = false;
            wpNotification.succeed();

            // now have the initial bundles, we can start browsersync
            return browserSync.init(bsConfig);
        }

        // send editing errors to console and browser
        if (stats.hasErrors() || stats.hasWarnings()) {
            console.log(chalk.red(stats.toString('errors-only')));
            return browserSync.sockets.emit('fullscreen:message', {
                title: 'Webpack Error:',
                body: stats.toString('errors-only'),
                timeout: 100000,
            });
        }

        // announce the changes
        return browserSync.reload();
    }
);

// ********************************** Sass **********************************

const chokidar = require('chokidar');

const sassDir = path.resolve(__dirname, '../', 'static', 'src', 'stylesheets');
const sassGraph = require('sass-graph').parseDir(sassDir, {
    loadPaths: sassDir,
});

const compileSass = require('../tools/compile-css');
const copyFiles = require('../tools/__tasks__/compile/conf/copy');

// when we detect a change in a sass file, we look up the tree of imports
// and only compile what we need to. anything matching this regex, we can just ignore in dev.
const ignoredSassRegEx = /^(_|ie9|old-ie)/;

chokidar.watch(`${sassDir}/**/*.scss`).on('change', changedFile => {
    // see what top-level files need to be recompiled
    const filesToCompile = [];

    sassGraph.visitAncestors(changedFile, ancestorPath => {
        const ancestorFileName = path.basename(ancestorPath);
        if (!ignoredSassRegEx.test(ancestorFileName)) {
            filesToCompile.push(ancestorFileName);
        }
    });

    // now recompile all files that matter
    Promise.all(filesToCompile.map(compileSass))
        .then(() => {
            // clear any previous error messages
            browserSync.sockets.emit('fullscreen:message:clear');

            // announce the changes
            browserSync.reload(
                filesToCompile.map(file => file.replace('scss', 'css'))
            );
        })
        .then(() => {
            copyFiles.task();
        })
        .catch(e => {
            // send editing errors to console and browser
            console.log(chalk.red(`\n${e.formatted}`));
            browserSync.sockets.emit('fullscreen:message', {
                title: 'CSS Error:',
                body: e.formatted,
                timeout: 100000,
            });
        });
});
