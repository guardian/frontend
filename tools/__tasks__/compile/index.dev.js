module.exports = {
    description: 'Compile assets for development',
    task: [
        require('./css'),
        require('./javascript'),
        require('./fonts'),
        require('./conf')
    ]
};
