module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean.mjs'),
        require('../inline-svgs/index.mjs'),
        require('./webpack-atoms'),
    ],
};
