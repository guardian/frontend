module.exports = {
    description: 'Validate commits',
    task: [require('./javascript'), require('./sass')],
    concurrent: true,
};
