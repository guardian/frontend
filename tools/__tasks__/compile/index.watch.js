module.exports = {
    description: 'Compile assets for development',
    task: [
        require('./conf/clean'),
        require('./css/index.dev'),
        require('./javascript/index.watch'),
        require('./fonts'),
        require('./conf'),
    ],
};
