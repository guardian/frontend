module.exports = [{
    title: 'Copy/minify SVGs',
    task: [
        require('./copy'),
        require('./minify')
    ]
}];
