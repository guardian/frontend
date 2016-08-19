'use strict';

const https = require('https');

const hostname = 'https://amp.theguardian.com';

exports.get = endpoint => makeRequest(endpoint).then(getBody);

function makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const errorMessage = `Unable to fetch ${endpoint}`;

        const req = https.get(hostname + endpoint, res => {
            if (res.statusCode !== 200) {
                res.resume(); // must consume data, see https://nodejs.org/api/http.html#http_class_http_clientrequest
                reject(new Error(errorMessage + ` Status code was ${res.statusCode}`));
            } else {
                resolve(res);
            }
        });
        req.on('error', error => {
            reject(new Error(errorMessage + ` ${error.message}`));
        });
        req.end();
    });
}

function getBody(res) {
    let body = '';
    return new Promise((resolve, reject) => {
        res.on('data', chunk => body += chunk)
            .on('end', () => resolve(body))
            .on('error', reject);
    });
}
