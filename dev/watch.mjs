#!/usr/bin/env node

import path, { dirname } from 'path';
import cpy from 'cpy';
import chalk from 'chalk';
import { glob } from 'node:fs/promises';

// ********************************** JAVASCRIPT **********************************

// webpack watch task always performs an intial bundle, and we don't want browsersync
// listening at the point. so we use this flag to know whether any change webpack reports
// is the initial bundle, or subsequent file changes
let INITIAL_BUNDLE = true;

// just a bit of visual feedback while webpack creates its initial bundles.
// fakes a listr step
import ora from 'ora';

const wpNotification = ora({
	text: 'Create initial webpack bundles',
	color: 'yellow',
});
wpNotification.start();

import webpack from 'webpack';

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

			return undefined;
		}

		const info = stats.toJson();
		// send editing errors to console and browser
		if (stats.hasErrors()) {
			console.log(chalk.red(info.errors));
			return undefined;
		}

		if (stats.hasWarnings()) {
			console.warn(chalk.yellow(info.warnings));
		}

		// announce the changes
		console.log(
			stats.toString({
				all: false,
				entrypoints: true, // show which entry points have been modified
				colors: true,
			}),
		);
		return undefined;
	},
];

const mainWebpackBundler = webpack(
	(await import('../webpack.config.dev.js')).default,
);

mainWebpackBundler.watch(...watchArguments);

// ********************************** Sass **********************************

import chokidar from 'chokidar';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sassDir = path.resolve(__dirname, '../', 'static', 'src', 'stylesheets');
const targetDir = path.resolve(__dirname, '../', 'static', 'target');
const inlineStylesDir = path.resolve(
	__dirname,
	'../',
	'common',
	'conf',
	'assets',
	'inline-stylesheets',
);

import { parseDir } from 'sass-graph';

const sassGraph = parseDir(sassDir, {
	loadPaths: [sassDir],
});

import { compileSass } from '../tools/compile-css.mjs';

// when we detect a change in a sass file, we look up the tree of imports
// and only compile what we need to. anything matching this regex, we can just ignore in dev.
const ignoredSassRegEx = /^(_|ie9|old-ie)/;

chokidar.watch(await Array.fromAsync(glob(`${sassDir}/**/*.scss`))).on('change', (changedFile) => {
	// see what top-level files need to be recompiled
	const filesToCompile = [];
	const changedFileBasename = path.basename(changedFile);

	sassGraph.visitAncestors(changedFile, (ancestorPath) => {
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
		filesToCompile.map((fileName) => {
			// email styles should not be remified
			if (/head.email-(article|front).scss/.test(fileName)) {
				return compileSass(fileName, { remify: false });
			}

			return compileSass(fileName);
		}),
	)
		.then(() =>
			// copy stylesheets that are to be inlined
			Promise.all(
				filesToCompile
					.filter((file) => /head./.test(file))
					.map((file) =>
						cpy(
							[`**/${file.replace('.scss', '.css')}`],
							inlineStylesDir,
							{
								cwd: targetDir,
							},
						),
					),
			),
		)
		.then(() => {
			console.log(chalk.green('✔️ Stylesheets compiled'));
		})
		.catch((e) => {
			// send editing errors to console and browser
			console.log(chalk.red(`\n${e.formatted}`));
		});
});
