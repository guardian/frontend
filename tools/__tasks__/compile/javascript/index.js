module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean'),
        require('../inline-svgs'),
        require('./copy'),
        require('./babel'),
        require('./bundle'),
        require('./bundle-app'),
        require('./bundle-shims')
    ]
};
