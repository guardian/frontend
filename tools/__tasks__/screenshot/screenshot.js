const webshot = require('webshot');

/**
 * TODO
 *  - Vary by environment
 *  - Generate nicer viewing output
 *  - Generate copy paste into github
 *  - Screenshot 'components' by classname (captureSelector)
 */
const webshotOptions = {
        shotSize: {
            width: 'window',
            height: 'all'
        },
        timeout: 120000 // We're going to wait two minutes before bailing on the screenshot
    };

const {paths, breakpoints, host, screenshotsDir} = require('./config');

function takeScreenshots() {
    const taskArray =
        paths.map((path) => {
            return Object.keys(breakpoints).map((breakpointName) => {

                const options = Object.assign({}, webshotOptions, {
                    windowSize: {
                        width: breakpoints[breakpointName]
                    }
                });

                return {
                    description: `Screenshotting ${path} on ${breakpointName}`,
                    task: () => {
                        return new Promise((resolve, reject) => {
                            return webshot(host + path, `${screenshotsDir}/${encodeURIComponent(path)}/${breakpointName}.png`, options, (err) => {
                                if (err) {
                                    return reject(err);
                                } else {
                                    return resolve();
                                }
                            });
                        });
                    }
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
