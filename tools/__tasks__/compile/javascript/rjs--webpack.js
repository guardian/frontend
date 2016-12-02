const path = require('path');
const pify = require('pify');
const rjs = require('requirejs');

const {target} = require('../../config').paths;

const bundles = [{
    name: 'boot-rjs',
    out: target + '/javascripts/boot-rjs.js',
    insertRequire: ['boot-rjs'],
    exclude: [
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/commercial',
    out: target + '/javascripts/bootstraps/commercial-rjs.js',
    exclude: [
        'boot-rjs',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/main',
    out: target + '/javascripts/bootstraps/enhanced/main-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/article',
    out: target + '/javascripts/bootstraps/enhanced/article-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/article-minute',
    out: target + '/javascripts/bootstraps/enhanced/article-minute-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/crosswords',
    out: target + '/javascripts/bootstraps/enhanced/crosswords-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/liveblog',
    out: target + '/javascripts/bootstraps/enhanced/liveblog-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/gallery',
    out: target + '/javascripts/bootstraps/enhanced/gallery-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/trail',
    out: target + '/javascripts/bootstraps/enhanced/trail-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/profile',
    out: target + '/javascripts/bootstraps/enhanced/profile-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/sudoku',
    out: target + '/javascripts/bootstraps/enhanced/sudoku-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/image-content',
    out: target + '/javascripts/bootstraps/enhanced/image-content-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/facia',
    out: target + '/javascripts/bootstraps/enhanced/facia-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/football',
    out: target + '/javascripts/bootstraps/enhanced/football-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/preferences',
    out: target + '/javascripts/bootstraps/enhanced/preferences-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/membership',
    out: target + '/javascripts/bootstraps/enhanced/membership-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/ophan',
    out: target + '/javascripts/bootstraps/enhanced/ophan-rjs.js'
}, {
    name: 'bootstraps/admin',
    out: target + '/javascripts/bootstraps/admin-rjs.js'
}, {
    name: 'bootstraps/enhanced/youtube',
    out: target + '/javascripts/bootstraps/enhanced/youtube-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/media/main',
    out: target + '/javascripts/bootstraps/enhanced/media/main-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ],
    generateSourceMaps: true,
    preserveLicenseComments: false
}, {
    name: 'bootstraps/video-embed',
    out: target + '/javascripts/bootstraps/video-embed-rjs.js',
    exclude: [
        'boot-rjs',
        'text',
        'inlineSvg'
    ],
    generateSourceMaps: true,
    preserveLicenseComments: false
}, {
    name: 'bootstraps/enhanced/accessibility',
    out: target + '/javascripts/bootstraps/enhanced/accessibility-rjs.js',
    exclude: [
        'boot-rjs',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'bootstraps/enhanced/facia',
        'text',
        'inlineSvg'
    ]
}];

module.exports = {
    description: 'Create r.js bundles for Webpack',
    task: bundles.sort((a,b) => a.name < b.name ? -1 : 1).map(bundle => {
        const options = Object.keys(bundle).reduce((command, optionName) =>
            `${optionName}=${bundle[optionName].toString()} ${command}`
        , '');
        return {
            description: bundle.name,
            task: `r.js -o ${path.join(__dirname, 'rjs.config.js')} ${options}`
        };
    }),
    concurrent: true
};
