module.exports = {
    description: 'Compile assets for production',
    task: [
        require('./conf/clean.mjs'),
        require('./css/index.mjs'),
        require('./data'),
        require('./javascript'),
        require('./hash'),
        require('./conf/index.mjs'),
    ],
};
