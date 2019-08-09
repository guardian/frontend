module.exports = {
    description: 'Clean and build data assets',
    task: [require('./clean'), require('./aib_cmp')],
};
