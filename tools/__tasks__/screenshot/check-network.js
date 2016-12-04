const tcpp = require('tcp-ping');
const pify = require('pify');

const domain = 'localhost';
const port = 9000;

module.exports = {
    description: `Probing ${domain} on port ${port}...`,
    task: () => pify(tcpp.probe, {multiArgs: true})(domain, port).then((result) => {
        if (!result[0]) {
            throw new Error('Cannot reach the network - is your server running?');
        }
    })
};
