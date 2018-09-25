module.exports = {
    description: 'Compile Data assets (dev)',
    task: [
        require('./clean'),
        require('./copy'),
        require('./transform')
    ],
};
