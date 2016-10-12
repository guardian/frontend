module.exports = [{
    title: 'Compile assets for development',
    task: [
        require('./css/compile.dev'),
        require('./javascript/compile.dev'),
        require('./fonts/compile'),
        // require('./conf')
    ]
}];
