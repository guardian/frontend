module.exports = {
    description: 'Compile assets for production',
    task: [
        require('./css'),
        require('./javascript'),
        require('./fonts'),
        require('./deploys-radiator'),
        require('./hash'),
        require('./conf')
    ]
};
