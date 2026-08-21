const fs = require('fs');
const path = require('path');

const gzipSize = require('gzip-size');
const pretty = require('prettysize');
const cssstats = require('cssstats');
const chalk = require('chalk');

const cloudwatch = require('./cloudwatch');

const { target } = require('../__tasks__/config.mjs').paths;

const credentials = '/etc/gu/frontend.properties';

const getAssets = (globPattern, exclude = []) =>
	fs.globSync(globPattern, {
		exclude: exclude,
		withFileTypes: true,
	})
	.filter(entry => entry.isFile())
	.map(entry => path.join(entry.parentPath, entry.name));

const files = [].concat(
	getAssets(`${target}/javascripts/**/*.js`, exclude=['**/{components,vendor}/**']),
	getAssets(`${target}/stylesheets/**/*`, exclude=['**/*head.identity.css']),
);

const size = (filePath, fileData) => {
	const unZipped = fs.statSync(filePath).size;
	const zipped = gzipSize.sync(fileData);
	return {
		uncompressed: Number((unZipped / 1024).toFixed(1)),
		uncompressedPretty: pretty(unZipped),
		compressed: Number((zipped / 1024).toFixed(1)),
		compressedPretty: pretty(zipped),
	};
};

const css = (filePath, fileData) => {
	if (!filePath.match(/.css$/)) return {};
	const {
		rules: { total: rules },
		selectors: { total: totalSelectors },
	} = cssstats(fileData, { mediaQueries: false });

	return {
		rules,
		totalSelectors,
		averageSelectors: +(totalSelectors / rules).toFixed(1),
	};
};

const analyse = (filePath) => {
	console.log(`Analysing ${filePath}`);
	try {
		const fileData = fs.readFileSync(filePath, 'utf8');

		const gzipData = size(filePath, fileData);
		const cssData = css(filePath, fileData);
		const data = Object.assign(gzipData, cssData);

		console.log(`Uncompressed: ${chalk.cyan(data.uncompressedPretty)}`);
		console.log(`Compressed: ${chalk.cyan(data.compressedPretty)}`);

		return cloudwatch
			.configure(credentials)
			.then(() => cloudwatch.log(path.basename(filePath), data))
			.then((msg) => {
				console.log(
					chalk.green(
						`Successfully logged file data to CloudWatch ${msg.id}`,
					),
				);
				return true;
			})
			.catch(console.log);
	} catch (e) {
		console.log(e);
		return null;
	}
};

files.forEach(analyse);
