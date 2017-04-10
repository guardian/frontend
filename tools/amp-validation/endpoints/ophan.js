const http = require('http');

const fetch = () => new Promise((resolve, reject) => {
    const errorMessage = 'Failed to fetch top traffic endpoints from ophan.';
    const opts = {
        hostname: 'api.ophan.co.uk',
        path: '/api/mostread?count=50',
    };

    const req = http.get(opts, res => {
        if (res.statusCode !== 200) {
            // must consume data, see https://nodejs.org/api/http.html#http_class_http_clientrequest
            res.resume();
            reject(
                new Error(`${errorMessage} Status code was ${res.statusCode}`)
            );
        } else {
            resolve(res);
        }
    });

    req.on('error', error => {
        reject(new Error(`${errorMessage} ${error.message}`));
    });
    req.end();
});

const getEndpointsFromResponse = res => {
    let body = '';
    return new Promise((resolve, reject) => {
        res
            .on('data', chunk => {
                body += chunk;
            })
            .on('end', () => {
                const endpoints = JSON.parse(body).map(hit =>
                    hit.url.replace(/^https?:\/\/www\.theguardian\.com/, ''));
                resolve(endpoints);
            })
            .on('error', reject);
    });
};

module.exports = fetch().then(getEndpointsFromResponse);
