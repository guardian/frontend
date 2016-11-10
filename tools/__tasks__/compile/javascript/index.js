module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean'),
        require('../inline-svgs'),
        require('./copy'),
        require('./bundle'),
        require('./bundle-webpack'),
        require('./webpack'),
        require('./bundle-app'),
        require('./bundle-app-webpack'),
        require('./bundle-shims'),
        require('./minify')
    ]
};
