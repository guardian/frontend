const path = require('path');
const webpackMerge = require('webpack-merge');
const config = require('./webpack.config.js');

// override JS entry points
config.entry = {
    'commercial': path.join(
        __dirname,
        'static',
        'src',
        'javascripts',
        'bootstraps',
        'commercial.dcr.ts'
    ),
};

// The Ophan alias removes duplicating the js in the commercial bundle sent to DCR.
module.exports = webpackMerge.smart(config, {
    output: {
        path: path.join(__dirname, 'static', 'target', 'javascripts'),
    },
    resolve: {
        alias: {
            "ophan/ng": path.join(__dirname, 'static', 'src', 'javascripts', 'bootstraps', 'commercial-ophan.dcr.js'),
        },
    },
});
