module.exports = {
    description: 'Lint assets',
    task: [
        require('./javascript'),
        require('./javascript-flow'),
        require('./sass'),
    ],
    concurrent: true,
};
