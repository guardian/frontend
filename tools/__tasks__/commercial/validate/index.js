module.exports = {
    description: 'Lint and format commercial assets',
    task: [
        require('./prettier'),
        require('../../validate'),
    ],
    concurrent: true,
};
