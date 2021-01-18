const request = require('request');
const promiseRetry = require('promise-retry');
const once = require('lodash/once');

const fetch = options => {
    const onError = once(error => {
        if (options.host === exports.hosts.dev) {
            console.error(
                `A 200 was not returned \n\n Are you running the article or dev-build app? \n \n ${
                    error.message
                }`
            );
        }
        throw error;
    });

    return promiseRetry(
        retry =>
            new Promise(resolve => {
                const errorMessage = `Unable to fetch ${options.endpoint}`;

                request(
                    {
                        uri: `${options.host + options.endpoint}`,
                        followRedirect: false
                    },
                    (error, resp, body) => {
                        if (error || resp.statusCode !== 200) {
                            console.error(errorMessage);
                            resolve({}); // Resolve with empty so we can skip endpoint validation
                        } else {
                            resolve({ resp, body });
                        }
                    }
                );
            }).catch(retry),
        {
            retries: 2,
        }
    ).catch(onError);
};

exports.get = opts => {
    const options = Object.assign(
        {
            endpoint: '',
            host: exports.hosts.dev,
        },
        opts
    );

    return fetch(options);
};

exports.hosts = {
    dev: 'http://localhost:9000',
    amp: 'https://amp.theguardian.com',
    prod: 'https://www.theguardian.com',
};
