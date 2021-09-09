module.exports = {
    description: 'Compile assets for development',
    task: [
        require('./conf/clean'),
        require('./css/index.dev'),
        require('./data/index.dev'),
        require('./javascript/index.dev'),
        require('./conf'),
    ],
};
