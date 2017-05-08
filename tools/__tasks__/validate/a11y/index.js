const checkNetwork = require('../../lib/check-network');
const { domain, port } = require('./config');

module.exports = {
    description: 'Ok, analysing accessibility for you... This may take a while ⏳',
    task: [checkNetwork(domain, port), require('./a11y')],
};
