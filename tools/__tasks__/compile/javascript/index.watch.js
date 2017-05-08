module.exports = {
    description: 'Prepare JS for development',
    task: [
        require('../inline-svgs'),
        require('./clean'),
        require('./copy'),
        require('./bundle-polyfills'),
    ],
};
