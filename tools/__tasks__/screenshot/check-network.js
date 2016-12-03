const request = require('request');

function checkNetwork() {
    return new Promise((resolve, reject) => {
        request('http://www.theguardian.com', {
            timeout: 30000
        }, (err, response) => {
            if (!err && response.statusCode == 200) {
                return resolve('Network found');
            } else {
                return reject(new Error('Couldn\`t hit the network - is your server running?'));
            }
        });
    });
}

module.exports = {
    description: 'Checking the network...',
    task: checkNetwork
};
