module.exports = {
    description: 'Compile assets for production',
    task: [
        require('./conf/clean'),
        require('./css'),
        require('./javascript'),
        // not quite yet...
        // require('./ui'),
        require('./fonts'),
        require('./hash'),
        require('./conf'),
    ],
};
