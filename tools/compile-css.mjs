// unified CSS creation module. used for prod and dev/watch tasks.
// writes files to `static/target/stylesheets` i.e. has side-effects
// exports a function which takes:
// 1. glob for files in static/src/stylesheets
// 2. options object offering `remify` (boolean) and `browsers` (browserlist)

import fs from 'node:fs';
import path from 'node:path';

import mkdirp from 'mkdirp';
import glob from 'glob';
import pify from 'pify';

import sass from 'node-sass';

import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';

const sassRenderP = pify(sass.render);
const writeFileP = pify(fs.writeFile);

import { paths } from './__tasks__/./config.mjs';

const { src, target } = paths;

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

const getFiles = (sassGlob) => glob.sync(path.resolve(sassDir, sassGlob));

export default (sassGlob, { remify = true, browsers = BROWSERS_LIST } = {}) => {
	if (typeof sassGlob !== 'string') {
		return Promise.reject(new Error('No glob provided.'));
	}

	return Promise.all(
		getFiles(sassGlob).map((filePath) => {
			const dest = path.resolve(
				target,
				'stylesheets',
				path.relative(sassDir, filePath).replace('scss', 'css'),
			);
			const sassOptions = Object.assign(
				{
					file: filePath,
					outFile: dest,
					sourceMapContents: true,
					includePaths: ['node_modules'],
				},
				SASS_SETTINGS,
			);

			const postcssPlugins = [
				autoprefixer({ overrideBrowserslist: browsers }),
			];
			if (remify) {
				postcssPlugins.push(pxtorem(REMIFICATIONS));
			}

			mkdirp.sync(path.parse(dest).dir);
			return sassRenderP(sassOptions)
				.then((result) =>
					postcss(postcssPlugins).process(result.css.toString(), {
						from: filePath,
						to: dest,
						map: {
							inline: false,
							prev: result.map.toString(),
						},
					}),
				)
				.then((result) =>
					Promise.all([
						writeFileP(dest, result.css.toString()),
						writeFileP(`${dest}.map`, result.map.toString()),
					]),
				);
		}),
	);
};
