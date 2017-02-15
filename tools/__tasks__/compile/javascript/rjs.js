const path = require('path');

const { target } = require('../../config').paths;

const bundles = [{
    name: 'bootstraps/video-embed',
    out: `${target}/javascripts/bootstraps/video-embed.js`,
    exclude: [
        'text',
        'inlineSvg',
    ],
    generateSourceMaps: true,
    preserveLicenseComments: false,
}, {
    name: 'bootstraps/youtube-embed',
    out: `${target}/javascripts/bootstraps/youtube-embed.js`,
    exclude: [
        'text',
        'inlineSvg',
    ],
    generateSourceMaps: true,
    preserveLicenseComments: false,
}];

module.exports = {
    description: 'Create r.js bundles',
    task: bundles.sort((a, b) => (a.name < b.name ? -1 : 1)).map((bundle) => {
        const options = Object.keys(bundle).reduce((command, optionName) =>
            `${optionName}=${bundle[optionName].toString()} ${command}`
        , '');
        return {
            description: bundle.name,
            task: `r.js -o ${path.join(__dirname, 'rjs.config.js')} ${options}`,
        };
    }),
    concurrent: true,
};
