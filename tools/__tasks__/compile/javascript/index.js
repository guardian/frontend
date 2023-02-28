module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean'),
        require('../inline-svgs'),
        require('./copy'),
        require('./webpack'),
        require('./webpack-atoms'),
        require('./bundle-polyfills'),
    ],
};
