'use strict';

const https = require('https');
const http = require('http');
const promiseRetry = require('promise-retry');

const hostname = 'https://amp.theguardian.com';
const localHostname = 'http://localhost:9000';

const isDev = process.env.NODE_ENV === 'dev' || false;

exports.get = endpoint => makeRequest(endpoint).then(getBody);

function makeRequest(endpoint) {
    return promiseRetry(retry => {
        return new Promise((resolve, reject) => {
            const errorMessage = `Unable to fetch ${endpoint}`;
            const reqObj = isDev ? http.get : https.get;
            let reqEndpoint;

            if (isDev) {
                reqEndpoint = localHostname + endpoint + '?amp=1'
            } else {
                reqEndpoint = hostname + endpoint
            }

            const req = reqObj(reqEndpoint, res => {
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
        }).catch(retry);
    }, {
        retries: 2
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
