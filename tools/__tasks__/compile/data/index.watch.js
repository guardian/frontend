module.exports = {
    description: 'Clean and build data assets (watch)',
    task: [require('./clean'), require('./aib_cmp')],
};
