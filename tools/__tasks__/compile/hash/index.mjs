import path from 'node:path';
import fs from 'node:fs';

import glob from 'glob';
import hasha from 'hasha';
import cpFile from 'cp-file';
import mkdirp from 'mkdirp';
import pify from 'pify';

const writeFile = pify(fs.writeFile);

import clean from './clean.mjs';
import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Version assets',
	task: (ctx, task) =>
		task.newListr(
			[
				clean,
				{
					title: 'Hash assets',
					task: () => {
						const webpackRegex = /graun\./;
						const webpackChunkRegex = /chunk/;
						const sourcemapRegex = /\.map$/;

						// create the hashed asset map for all files in target
						const assetMap = glob
							.sync('**/!(*.map)', {
								nodir: true,
								cwd: paths.target,
							})
							.reduce((map, assetPath) => {
								const assetLocation = path.resolve(
									paths.target,
									assetPath,
								);
								const hasSourceMap = fs.existsSync(
									`${assetLocation}.map`,
								);

								// webpack bundles come pre-hashed, so we won't hash them, just add them
								if (webpackRegex.test(assetPath)) {
									const sourcemap = hasSourceMap
										? {
												[`${assetPath}.map`]: `${assetPath}.map`,
										  }
										: {};

									return Object.assign(
										map,
										{ [assetPath]: assetPath },
										sourcemap,
									);
								}

								// hash everything else as normal
								const assetHash = hasha.fromFileSync(
									assetLocation,
									{
										algorithm: 'md5',
									},
								);
								const hashedPath = path.join(
									path.dirname(assetPath),
									assetHash,
									path.basename(assetPath),
								);
								const sourcemap = hasSourceMap
									? {
											[`${assetPath}.map`]: `${hashedPath}.map`,
									  }
									: {};

								return Object.assign(
									map,
									{ [assetPath]: hashedPath },
									sourcemap,
								);
							}, {});

						return Promise.all(
							// copy all the built files to their hash locations
							Object.keys(assetMap).map((asset) =>
								cpFile(
									path.resolve(paths.target, asset),
									path.resolve(paths.hash, assetMap[asset]),
								),
							),
						)
							.then(() => {
								// we need unhashed keys for webpack entry bundles so we can refer to them in play templates.
								// since they arrived ready-hashed, we need to add some new ones from the hashed ones...

								// get the webpack entry bundles
								const webpackEntryBundles = Object.keys(
									assetMap,
								).filter(
									(key) =>
										webpackRegex.test(key) &&
										!webpackChunkRegex.test(key) &&
										!sourcemapRegex.test(key),
								);

								// create a new key for each one and add them them to asset map
								return Object.assign(
									{},
									assetMap,
									webpackEntryBundles.reduce(
										(map, webpackEntryBundle) =>
											Object.assign(map, {
												[webpackEntryBundle.replace(
													/(javascripts\/)(.+\/)/,
													'$1',
												)]:
													assetMap[
														webpackEntryBundle
													],
											}),
										{},
									),
									webpackEntryBundles.reduce(
										(map, webpackEntryBundle) =>
											Object.assign(map, {
												[webpackEntryBundle.replace(
													/(javascripts\/commercial\/)(.+\/)/,
													'$1',
												)]:
													assetMap[
														webpackEntryBundle
													],
											}),
										{},
									),
								);
							})
							.then(
								(
									normalisedAssetMap, // save the asset map
								) =>
									mkdirp(
										path.resolve(paths.hash, 'assets'),
									).then(() =>
										writeFile(
											path.resolve(
												paths.hash,
												'assets',
												'assets.map',
											),
											JSON.stringify(
												normalisedAssetMap,
												null,
												4,
											),
										),
									),
							);
					},
				},
			],
			{ concurrent: false },
		),
};

export default task;
