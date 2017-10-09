module.exports = {
    description: 'Lint assets',
    task: [require('./javascript'), require('./sass'), require('./check-for-disallowed-strings')],
    concurrent: true,
};
