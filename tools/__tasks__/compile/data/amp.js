const path = require('path');
const cpy = require('cpy');

const { paths } = require('../../config');

// Source
const ampIframeHtml = path.join(paths.vendor, 'data/amp-iframe.html');

// Destinations
// The static assets
const staticDir = path.resolve(paths.target, 'data', 'vendor');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Copy AMP iframe HTML',
	task: () =>
		cpy(ampIframeHtml, staticDir, {
			parents: false,
			nodir: false,
		}),
};

module.exports = task;
