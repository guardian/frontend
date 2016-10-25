module.exports = {
    description: 'Compile assets for development',
    task: [
        require('./css/index.dev'),
        require('./javascript/index.dev'),
        require('./fonts'),
        require('./conf')
    ]
};
