module.exports = {
    description: 'Compile assets for development',
    task: [
        require('./conf/clean'),
        require('./css/index.dev'),
        require('./data/index.watch'),
        require('./javascript/index.watch'),
        require('./conf'),
    ],
};
