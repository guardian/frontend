module.exports = {
    description: 'Clean, download and build data assets (watch)',
    task: [require('./clean'), require('./download'), require('./amp')],
};
