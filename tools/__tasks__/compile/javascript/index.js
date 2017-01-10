module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean'),
        require('../inline-svgs'),
        require('./copy'),
        require('./babel'),
        require('./rjs'),
        require('./rjs--webpack'),
        require('./webpack'),
        require('./bundle-app--rjs'),
        require('./bundle-app--webpack'),
        require('./bundle-shims'),
    ],
};
