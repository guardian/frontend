module.exports = {
    description: 'Prepare JS for development',
    task: [
        require('../inline-svgs/index.mjs'),
        require('./clean.mjs'),
        require('./copy.mjs'),
        require('../../commercial/compile'),
        require('./webpack.dev'),
        require('./webpack-dcr.dev'),
        require('./bundle-polyfills.mjs'),
    ],
};
