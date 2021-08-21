module.exports = {
    description: 'Generate commercial bundle graph',
    task: [
        require('./compile'),
        require('./graph'),
    ],
    concurrent: true,
};
