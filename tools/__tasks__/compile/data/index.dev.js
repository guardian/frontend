module.exports = {
    description: 'Clean download and build data assets (dev)',
    task: [
        require('./clean'),
        require('./download'),
        require('./aib_cmp'),
        require('./amp'),
    ],
};
