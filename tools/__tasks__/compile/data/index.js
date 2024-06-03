module.exports = {
    description: 'Clean download and build data assets',
    task: [require('./clean.mjs'), require('./download.mjs'), require('./amp.mjs')],
};
