module.exports = {
    description: 'Test assets',
    task: [require('../compile/data'), require('./javascript')],
    concurrent: true,
};
