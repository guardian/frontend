const webshot = require('webshot');

/**
 * TODO
 *  - Vary by environment
 *  - Generate nicer viewing output
 *  - Generate copy paste into github
 *  - Screenshot 'components' by classname (captureSelector)
 */
const environment = 'prod'; // Hardcode this for the moment
const domain = {
        prod: 'www.theguardian.com',
        code: 'm.code.dev-theguardian.com',
        dev: 'localhost:9000'
    }[environment];
const host = 'http://' + domain + '/';
const paths = [
        'uk',
        'us',
        'au'
    ];
const breakpoints = {
        wide: 1300,
        desktop: 980,
        tablet: 740,
        mobile: 320
    };
const screenshotsDir = 'screenshots';
const webshotOptions = {
        shotSize: {
            width: 'window',
            height: 'all'
        },
        timeout: 120000 // We're going to wait two minutes before bailing on the screenshot
    };



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
