module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean'),
        require('../inline-svgs'),
        require('./copy'),
        require('./bundle-rjs'),
        require('./bundle-webpack'),
        require('./webpack'),
        require('./concat-rjs'),
        require('./concat-webpack'),
        require('./bundle-shims')
    ]
};
