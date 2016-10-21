module.exports = {
    description: 'Copy/minify SVGs',
    task: [
        require('./copy'),
        require('./minify')
    ]
};
