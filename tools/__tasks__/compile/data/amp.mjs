import path from 'node:path';
import cpy from 'cpy';

import { paths } from '../../config.mjs';

const { vendor, target } = paths;

// Source
const ampIframeHtml = path.join(vendor, 'data/amp-iframe.html');

// Destinations
// The static assets
const staticDir = path.resolve(target, 'data', 'vendor');

export default {
	description: 'Copy AMP iframe HTML',
	task: () =>
		cpy(ampIframeHtml, staticDir, {
			parents: false,
			nodir: false,
		}),
};
