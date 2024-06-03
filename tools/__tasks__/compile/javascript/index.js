module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean.mjs'),
        require('../inline-svgs/index.mjs'),
        require('./copy.mjs'),
        require('./webpack'),
        require('./webpack-atoms'),
        require('./bundle-polyfills.mjs'),
    ],
};
