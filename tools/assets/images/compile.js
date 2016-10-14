module.exports = [{
    title: 'Compile images',
    task: [
        require('./copy'),
        require('./sprite')
    ]
}];
