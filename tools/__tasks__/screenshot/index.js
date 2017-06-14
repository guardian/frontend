const checkNetwork = require('../lib/check-network');
const { domain, port } = require('./config');

module.exports = {
    description:
        'Ok, taking some screenshots for you... This may take a while ⏳',
    task: [checkNetwork(domain, port), require('./screenshot')],
};
