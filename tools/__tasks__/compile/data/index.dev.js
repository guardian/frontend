module.exports = {
    description: 'Clean and build data assets (dev)',
    task: [require('./clean'), require('./aib_cmp')],
};
