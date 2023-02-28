#!/usr/bin/env node

const path = require('path');
const cpy = require('cpy');
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

const watchArguments = [
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

        const info = stats.toJson();
        // send editing errors to console and browser
        if (stats.hasErrors()) {
            console.log(chalk.red(info.errors));
            return browserSync.sockets.emit('fullscreen:message', {
                title: 'Webpack Error:',
                body: info.errors,
                timeout: 100000,
            });
        }

        if (stats.hasWarnings()) {
            console.warn(chalk.yellow(info.warnings));
        }

        // announce the changes
        return browserSync.reload();
    },
];

const mainWebpackBundler = webpack(require('../webpack.config.dev.js'));

mainWebpackBundler.run(() => {
    console.log(chalk.blue('initial frontend bundle created, only watching commercial now'))
});

// ********************************** Sass **********************************

const chokidar = require('chokidar');

const sassDir = path.resolve(__dirname, '../', 'static', 'src', 'stylesheets');
const targetDir = path.resolve(__dirname, '../', 'static', 'target');
const inlineStylesDir = path.resolve(
    __dirname,
    '../',
    'common',
    'conf',
    'assets',
    'inline-stylesheets'
);
const sassGraph = require('sass-graph').parseDir(sassDir, {
    loadPaths: [sassDir],
});

const compileSass = require('../tools/compile-css');

// when we detect a change in a sass file, we look up the tree of imports
// and only compile what we need to. anything matching this regex, we can just ignore in dev.
const ignoredSassRegEx = /^(_|ie9|old-ie)/;

chokidar.watch(`${sassDir}/**/*.scss`).on('change', changedFile => {
    // see what top-level files need to be recompiled
    const filesToCompile = [];
    const changedFileBasename = path.basename(changedFile);

    sassGraph.visitAncestors(changedFile, ancestorPath => {
        const ancestorFileName = path.basename(ancestorPath);
        if (!ignoredSassRegEx.test(ancestorFileName)) {
            filesToCompile.push(ancestorFileName);
        }
    });

    if (!/^_/.test(changedFileBasename)) {
        filesToCompile.push(changedFileBasename);
    }

    // now recompile all files that matter
    Promise.all(
        filesToCompile.map(fileName => {
            // email styles should not be remified
            if (/head.email-(article|front).scss/.test(fileName)) {
                return compileSass(fileName, { remify: false });
            }

            return compileSass(fileName);
        })
    )
        .then(() =>
            // copy stylesheets that are to be inlined
            Promise.all(
                filesToCompile
                    .filter(file => /head./.test(file))
                    .map(file =>
                        cpy(
                            [`**/${file.replace('.scss', '.css')}`],
                            inlineStylesDir,
                            {
                                cwd: targetDir,
                            }
                        )
                    )
            )
        )
        .then(() => {
            // clear any previous error messages
            browserSync.sockets.emit('fullscreen:message:clear');

            // announce the changes
            browserSync.reload(
                filesToCompile.map(file => file.replace('scss', 'css'))
            );
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
