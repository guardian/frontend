module.exports = {
    description: 'Compile assets for development',
    task: [
        require('./conf/clean.mjs'),
        require('./css/index.dev.mjs'),
        require('./data/index.dev'),
        require('./javascript/index.dev'),
        require('./conf/index.mjs'),
    ],
};
