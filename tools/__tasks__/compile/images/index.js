module.exports = {
    description: 'Compile images',
    task: [
        require('./clean'),
        require('./copy'),
        require('./icons'),
        require('./svg'),
    ],
};
