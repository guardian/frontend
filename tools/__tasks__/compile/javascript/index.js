module.exports = {
    description: 'Compile JS',
    task: [
        require('./clean'),
        'compile/inline-svgs',
        require('./copy'),
        require('./bundle'),
        require('./bundle-standard'),
        require('./bundle-shims'),
        require('./minify')
    ]
};
