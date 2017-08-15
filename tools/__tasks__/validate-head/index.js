module.exports = {
    description: 'Lint changed assets',
    task: [
        require('./javascript'),
        // require('./sass'),
    ],
    concurrent: true,
};
