module.exports = {
    description: 'Compile Data assets',
    task: [
        require('./clean'),
        require('./copy'),
    ],
};
