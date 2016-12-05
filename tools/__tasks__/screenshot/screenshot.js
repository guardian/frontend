const webshot = require('webshot');
const pify = require('pify');

/**
 * TODO
 *  - Vary by environment
 *  - Generate nicer viewing output
 *  - Generate copy paste into github
 *  - Screenshot 'components' by classname (captureSelector)
 */

const {paths, breakpoints, host, screenshotsDir, environment} = require('./config');

function takeScreenshots() {
    const taskArray =
        paths.map((path) => {
            return Object.keys(breakpoints).map((breakpointName) => {

                const options = {
                    shotSize: {
                        width: 'window',
                        height: 'all'
                    },
                    timeout: 120000, // We're going to wait two minutes before bailing on the screenshot
                    windowSize: {
                        width: breakpoints[breakpointName]
                    },
                    takeShotOnCallback: environment === 'dev' ? true : false
                };

                return {
                    description: `Screenshotting ${path} on ${breakpointName}`,
                    task: () => pify(webshot)(host + path, `${screenshotsDir}/${encodeURIComponent(path)}/${breakpointName}.png`, options).then((err) => {
                       if (err) {
                           throw new Error(err);
                       }
                    })
                };
            });
        });

    // Returned flattened promise array
    return [].concat(...taskArray);
}


module.exports = {
    description: 'Right, lets take those screenies',
    task: takeScreenshots(),
    concurrent: true
};
