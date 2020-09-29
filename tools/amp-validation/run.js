const amphtmlValidator = require('amphtml-validator');
const validatorJs = require('./validator-js');
const fetchPage = require('./fetch-page');

const isDev = process.env.NODE_ENV === 'dev' || false;

const failureThreshold = 3;

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
            const result = validator.validateString(res.body.toString());
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

            return result.status;
        })
        .catch(onError);

const maybeRunValidator = (validator, options) => endpoint => {
    const validate = runValidator(validator, options);
    const checkEither = options.checkIfAmp || options.checkIfDotComponents;
    if (!checkEither) {
        return validate(endpoint);
    }

    return fetchPage
        .get({
            endpoint,
            host: fetchPage.hosts.amp,
        })
        .then(res => {
            if (res.resp === undefined) {
                console.info('Skip failed fetch for', endpoint);
                return Promise.resolve('skipped');
            }

            if (
                (options.checkIfAmp &&
                    res.body.includes('<link rel="amphtml" href="')) ||
                (options.checkIfDotComponents &&
                    res.resp.headers['x-gu-dotcomponents'])
            ) {
                return validate(endpoint);
            }
            return Promise.resolve('not AMP');
        })
        .catch(onError);
};

const checkEndpoints = (endpoints, options) => validatorFilePath =>
    amphtmlValidator.getInstance(validatorFilePath).then(validator => {
        const tests = endpoints.map(maybeRunValidator(validator, options));
        Promise.all(tests).then(values => {
            const results = {
                passed: values.filter(x => x === 'PASS').length,
                failed: values.filter(x => x === 'FAIL').length,
                skipped: values.filter(x => x === 'skipped').length,
                notAmp: values.filter(x => x === 'not AMP').length,
            };

            const failed = results.failed > failureThreshold;
            const exitValue = failed ? 1 : 0; // every promise returns true <=> exit value is zero, build in some failure threshold
            const completionMessage = `Validator finished, there were ${
                results.passed
            } passes, ${results.failed} failures ${
                results.skipped
            } skipped and ${results.notAmp} non-AMP pages`;
            if (failed) {
                console.log(
                    `##teamcity[buildProblem description='${completionMessage}' identity='AMPValidation']`
                );
            } else {
                console.log(completionMessage);
            }

            validatorJs.cleanUp();
            process.exit(exitValue);
        });
    });

module.exports = opts => endpoints => {
    const options = {
        checkIfAmp: false,
            logErrors: true,
        ...opts
    };

    // TODO: re-add pre-release when/if google provide us with one
    validatorJs
        .fetchRelease()
        .then(checkEndpoints(endpoints, options))
        .catch(onError);
};
