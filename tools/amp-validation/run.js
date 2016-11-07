'use strict';

const amphtmlValidator = require('amphtml-validator');
const validatorJs = require('./validator-js');
const fetchPage = require('./fetch-page');

const isDev = process.env.NODE_ENV === 'dev' || false;

module.exports = (endpoints) => {
    // TODO: re-add pre-release when/if google provide us with one
    validatorJs.fetchRelease()
        .then(checkEndpoints(false, endpoints))
        .catch(onError);
};

function checkEndpoints(devChannel, endpoints) {
    return validatorFilePath => amphtmlValidator.getInstance(validatorFilePath)
        .then(validator => {
            const tests = endpoints.map(runValidator(validator, devChannel));

            Promise.all(tests)
                .then(values => {
                    const exitValue = values.every(Boolean) ? 0 : 1; // every promise returns true <=> exit value is zero
                    validatorJs.cleanUp();
                    process.exit(exitValue);
                });
        });
}

function runValidator(validator, devChannel) {

    return endpoint => fetchPage
        .get(endpoint)
        .then(res => {
            console.log(`Checking the AMP validity (${devChannel ? 'pre-release' : 'release'}) of the page at ${isDev ? 'localhost:9000' : ''}${endpoint}, result is:`);
            const result = validator.validateString(res);

            const pass = result.status === 'PASS';
            (pass ? console.log : console.error)(`Result for ${endpoint} was: ${result.status}`);
            result.errors.forEach(error => {
                ((error.severity === 'ERROR') ? console.error : console.warn)(buildErrorMessage(error));
            });

            return pass;
        }).catch(onError);
}

function onError(error) {

    try {
        require('megalog').error(`Are you running the article or dev-build app? \n \n ${error.message}`, {
            heading: 'A 200 was not returned'
        });
    } catch(e) {
        console.log(error.message)
    }

    validatorJs.cleanUp();
    process.exit(1);
}

function buildErrorMessage(error) {
    let msg = `line ${error.line}, col ${error.col}: ${error.message}`;
    if (error.specUrl !== null) {
        msg += ` (see ${error.specUrl})`;
    }
    return msg;
}

