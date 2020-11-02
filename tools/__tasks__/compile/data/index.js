module.exports = {
    description: 'Clean download and build data assets',
    task: [require('./clean'), require('./download'), require('./amp')],
};
