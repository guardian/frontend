const webshot = require('webshot');
const pify = require('pify');
const merge = require('lodash.merge');
const joinPath = require('path').join;

/**
 * TODO
 *  - Vary by environment
 *  - Generate nicer viewing output
 *  - Generate copy paste into github
 *  - Screenshot 'components' by classname (captureSelector)
 */

const {
    paths,
    breakpoints,
    host,
    screenshotsDir,
    environment,
} = require('./config');

const screenshotDefaults = {
    shotSize: {
        width: 'window',
        height: 'all',
    },
    timeout: 120000, // We're going to wait two minutes before bailing on the screenshot
    takeShotOnCallback: environment === 'ci',
};

// For each path, run a concurrent task that takes a screenshot of each path at each breakpoint
module.exports = {
    description: 'Right, lets take those screenies',
    task: paths.map(path => ({
        description: `Screenshotting ${path}`,
        task: Object.keys(breakpoints).map(breakpointName => ({
            description: `on ${breakpointName}`,
            task: () =>
                pify(webshot)(
                    host + path,
                    joinPath(
                        screenshotsDir,
                        encodeURIComponent(path),
                        `${breakpointName}.png`
                    ),
                    merge({}, screenshotDefaults, {
                        windowSize: { width: breakpoints[breakpointName] },
                    })
                ),
        })),
        concurrent: true,
    })),
    concurrent: true,
};
