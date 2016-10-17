module.exports = [{
    title: 'Compile JS',
    task: [
        require('./clean'),
        require('../inline-svgs/compile'),
        require('./copy'),
        require('./bundle'),
        require('./bundle-standard'),
        require('./bundle-shims'),
        require('./minify')
    ]
}];
