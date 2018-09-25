module.exports = {
    description: 'Compile Data assets (watch)',
    task: [
        require('./clean'),
        require('./copy'),
        require('./transform')
    ],
};
