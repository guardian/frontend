module.exports = {
    description: 'Compile assets for template rendering in Play',
    task: [
        require('./copy'),
        'compile/inline-svgs',
        require('./minify')
    ]
};
