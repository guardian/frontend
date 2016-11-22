const path = require('path');
const pify = require('pify');
const rjs = require('requirejs');

const {target} = require('../../config').paths;

const bundles = [{
    name: 'boot-webpack',
    out: target + '/javascripts/boot-webpack.js',
    insertRequire: ['boot-webpack'],
    exclude: [
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/commercial',
    out: target + '/javascripts/bootstraps/commercial-webpack.js',
    exclude: [
        'boot-webpack',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/main',
    out: target + '/javascripts/bootstraps/enhanced/main-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/article',
    out: target + '/javascripts/bootstraps/enhanced/article-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/article-minute',
    out: target + '/javascripts/bootstraps/enhanced/article-minute-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/crosswords',
    out: target + '/javascripts/bootstraps/enhanced/crosswords-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/liveblog',
    out: target + '/javascripts/bootstraps/enhanced/liveblog-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/gallery',
    out: target + '/javascripts/bootstraps/enhanced/gallery-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/trail',
    out: target + '/javascripts/bootstraps/enhanced/trail-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/profile',
    out: target + '/javascripts/bootstraps/enhanced/profile-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/sudoku',
    out: target + '/javascripts/bootstraps/enhanced/sudoku-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/image-content',
    out: target + '/javascripts/bootstraps/enhanced/image-content-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/facia',
    out: target + '/javascripts/bootstraps/enhanced/facia-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/football',
    out: target + '/javascripts/bootstraps/enhanced/football-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/preferences',
    out: target + '/javascripts/bootstraps/enhanced/preferences-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/membership',
    out: target + '/javascripts/bootstraps/enhanced/membership-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/ophan',
    out: target + '/javascripts/bootstraps/enhanced/ophan-webpack.js'
}, {
    name: 'bootstraps/admin',
    out: target + '/javascripts/bootstraps/admin-webpack.js'
}, {
    name: 'bootstraps/enhanced/youtube',
    out: target + '/javascripts/bootstraps/enhanced/youtube-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/media/main',
    out: target + '/javascripts/bootstraps/enhanced/media/main-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ],
    generateSourceMaps: true,
    preserveLicenseComments: false
}, {
    name: 'bootstraps/video-embed',
    out: target + '/javascripts/bootstraps/video-embed-webpack.js',
    exclude: [
        'boot-webpack',
        'text',
        'inlineSvg'
    ],
    generateSourceMaps: true,
    preserveLicenseComments: false
}, {
    name: 'bootstraps/enhanced/accessibility',
    out: target + '/javascripts/bootstraps/enhanced/accessibility-webpack.js',
    exclude: [
        'boot-webpack',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'bootstraps/enhanced/facia',
        'text',
        'inlineSvg'
    ]
}];

module.exports = {
    description: 'Create JS bundles to run alongside Webpack-bundled app',
    task: bundles.sort((a,b) => a.name < b.name ? -1 : 1).map(bundle => {
        const options = Object.keys(bundle).reduce((command, optionName) =>
            `${optionName}=${bundle[optionName].toString()} ${command}`
        , '');
        return {
            description: bundle.name,
            task: `r.js -o ${path.join(__dirname, 'bundle.config.js')} ${options}`
        };
    }),
    concurrent: true
};
