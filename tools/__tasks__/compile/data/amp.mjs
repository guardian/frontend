import path from 'node:path';
import cpy from 'cpy';

import { paths } from '../../config.mjs';

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

export default task;
