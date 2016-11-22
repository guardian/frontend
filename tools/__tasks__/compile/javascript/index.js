module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean'),
        require('../inline-svgs'),
        require('./copy'),
        require('./bundle'),
        require('./bundle-app'),
        require('./rename-boot-sourcemap'),
        require('./bundle-shims')
    ]
};
