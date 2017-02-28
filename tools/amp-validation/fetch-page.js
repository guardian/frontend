const request = require('request');
const promiseRetry = require('promise-retry');
const once = require('lodash/once');
const megalog = require('megalog');

function fetch(options) {
    const onError = once(error => {
        if (options.host === exports.hosts.dev) {
            try {
                megalog.error(
                    `Are you running the article or dev-build app? \n \n ${error.message}`,
                    {
                        heading: 'A 200 was not returned',
                    }
                );
            } catch (e) {
                // do nothing
            }
        }
        throw error;
    });

    return promiseRetry(
        retry => new Promise((resolve, reject) => {
            const errorMessage = `Unable to fetch ${options.endpoint}`;

            request(`${options.host + options.endpoint}?amp`, (
                error,
                resp,
                body
            ) => {
                if (error || resp.statusCode !== 200) {
                    const errorDetails = error ? error.message : '';
                    const statusCodeMessage = resp
                        ? ` Status code was ${resp ? resp.statusCode : ''}`
                        : '';

                    reject(
                        new Error(
                            `${errorMessage + statusCodeMessage}\n${errorDetails}`
                        )
                    );
                } else {
                    resolve(body);
                }
            });
        }).catch(retry),
        {
            retries: 2,
        }
    ).catch(onError);
}

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
