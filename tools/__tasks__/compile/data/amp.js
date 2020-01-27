const path = require('path');
const cpy = require('cpy');

const { vendor, target } = require('../../config').paths;

// Source
const ampIframeHtml = path.join(vendor, 'data/amp-iframe.html');

// Destinations
// The static assets
const staticDir = path.resolve(target, 'data', 'vendor');

module.exports = {
    description: 'Copy AMP iframe HTML',
    task: () =>
        cpy(ampIframeHtml, staticDir, {
            parents: false,
            nodir: false,
        }),
};
