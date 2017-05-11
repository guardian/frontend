const amphtmlValidator = require('amphtml-validator');
const partition = require('lodash/partition');

const validatorJs = require('./validator-js');
const fetchPage = require('./fetch-page');

const isDev = process.env.NODE_ENV === 'dev' || false;

const onError = error => {
    console.error(error.message);
    validatorJs.cleanUp();
    process.exit(1);
};

const buildErrorMessage = error => {
    let msg = `line ${error.line}, col ${error.col}: ${error.message}`;
    if (error.specUrl !== null) {
        msg += ` (see ${error.specUrl})`;
    }
    return msg;
};

const runValidator = (validator, options) => endpoint =>
    fetchPage
        .get({
            endpoint,
            host: isDev ? fetchPage.hosts.dev : fetchPage.hosts.amp,
        })
        .then(res => {
            const result = validator.validateString(res);
            const pass = result.status === 'PASS';
            const message = `${result.status} for: ${endpoint}`;

            (pass ? console.log : console.error)(message);
            if (options.logErrors) {
                result.errors.forEach(error => {
                    (error.severity === 'ERROR' ? console.error : console.warn)(
                        buildErrorMessage(error)
                    );
                });
            }

            return pass;
        })
        .catch(onError);

const maybeRunValidator = (validator, options) => endpoint => {
    const validate = runValidator(validator, options);
    if (!options.checkIfAmp) return validate(endpoint);

    return fetchPage
        .get({
            endpoint,
            host: fetchPage.hosts.prod,
        })
        .then(body => {
            if (body.includes('<link rel="amphtml" href="')) {
                return validate(endpoint);
            }
            return Promise.resolve(true);
        })
        .catch(onError);
};

const checkEndpoints = (endpoints, options) => validatorFilePath =>
    amphtmlValidator.getInstance(validatorFilePath).then(validator => {
        const tests = endpoints.map(maybeRunValidator(validator, options));

        Promise.all(tests).then(values => {
            const results = partition(values, Boolean);
            const exitValue = results[1].length ? 1 : 0; // every promise returns true <=> exit value is zero

            console.log(`Validator finished, there were ${results[0].length} passes and ${results[1].length} failures.`);
            validatorJs.cleanUp();
            process.exit(exitValue);
        });
    });

module.exports = opts => endpoints => {
    const options = Object.assign(
        {
            checkIfAmp: false,
            logErrors: true,
        },
        opts
    );

    // TODO: re-add pre-release when/if google provide us with one
    validatorJs
        .fetchRelease()
        .then(checkEndpoints(endpoints, options))
        .catch(onError);
};
