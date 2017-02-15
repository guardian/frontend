module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean'),
        require('../inline-svgs'),
        require('./copy'),
        require('./babel'),
        require('./rjs'),
        require('./webpack'),
        require('./bundle-shims'),
    ],
};
