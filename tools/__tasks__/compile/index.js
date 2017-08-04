module.exports = {
    description: 'Compile assets for production',
    task: [
        require('./conf/clean'),
        require('./css'),
        require('./javascript'),
        require('./ui'),
        require('./fonts'),
        require('./hash'),
        require('./conf'),
    ],
};
