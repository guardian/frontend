const path = require('path');
const pify = require('pify');
const rjs = require('requirejs');

const {target} = require('../../config').paths;

const bundles = [{
    name: 'boot',
    out: target + '/javascripts/boot.js',
    include: 'bootstraps/standard/main',
    insertRequire: ['boot'],
    exclude: [
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/commercial',
    out: target + '/javascripts/bootstraps/commercial.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/main',
    out: target + '/javascripts/bootstraps/enhanced/main.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/article',
    out: target + '/javascripts/bootstraps/enhanced/article.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/article-minute',
    out: target + '/javascripts/bootstraps/enhanced/article-minute.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/crosswords',
    out: target + '/javascripts/bootstraps/enhanced/crosswords.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/liveblog',
    out: target + '/javascripts/bootstraps/enhanced/liveblog.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/gallery',
    out: target + '/javascripts/bootstraps/enhanced/gallery.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/trail',
    out: target + '/javascripts/bootstraps/enhanced/trail.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/profile',
    out: target + '/javascripts/bootstraps/enhanced/profile.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/sudoku',
    out: target + '/javascripts/bootstraps/enhanced/sudoku.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/image-content',
    out: target + '/javascripts/bootstraps/enhanced/image-content.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/facia',
    out: target + '/javascripts/bootstraps/enhanced/facia.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/football',
    out: target + '/javascripts/bootstraps/enhanced/football.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/preferences',
    out: target + '/javascripts/bootstraps/enhanced/preferences.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/membership',
    out: target + '/javascripts/bootstraps/enhanced/membership.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
}, {
    name: 'bootstraps/enhanced/ophan',
    out: target + '/javascripts/bootstraps/enhanced/ophan.js'
}, {
    name: 'bootstraps/admin',
    out: target + '/javascripts/bootstraps/admin.js'
}, {
    name: 'bootstraps/enhanced/youtube',
    out: target + '/javascripts/bootstraps/enhanced/youtube.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ]
},
    {
    name: 'bootstraps/enhanced/media/main',
    out: target + '/javascripts/bootstraps/enhanced/media/main.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'text',
        'inlineSvg'
    ],
    generateSourceMaps: true,
    preserveLicenseComments: false
}, {
    name: 'bootstraps/video-embed',
    out: target + '/javascripts/bootstraps/video-embed.js',
    exclude: [
        'text',
        'inlineSvg'
    ],
    generateSourceMaps: true,
    preserveLicenseComments: false
}, {
    name: 'bootstraps/enhanced/accessibility',
    out: target + '/javascripts/bootstraps/enhanced/accessibility.js',
    exclude: [
        'boot',
        'bootstraps/standard/main',
        'bootstraps/commercial',
        'bootstraps/enhanced/main',
        'bootstraps/enhanced/facia',
        'text',
        'inlineSvg'
    ]
}];

module.exports = {
    description: 'Create r.js bundles',
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
