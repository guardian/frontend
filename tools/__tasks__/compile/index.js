module.exports = {
    description: 'Compile assets for production',
    task: [
        require('./conf/clean'),
        require('./css'),
        require('./data'),
        require('./javascript'),
        require('./hash'),
        require('./conf'),
    ],
};
