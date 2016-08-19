'use strict';

const amphtmlValidator = require('amphtml-validator');
const validatorJs = require('./validator-js');
const fetchPage = require('./fetch-page');

/*
    NB: these may be duplicated elsewhere in scala tests
    that extend AmpValidityTest - consider adding any new
    URLs there as well.  Not centralising as running full
    suite in scala tests may be overkill as we add more tests
 */
const endpoints = [
    '/commentisfree/2016/aug/09/jeremy-corbyn-supporters-voters-labour-leader-politics', // Comment tone
    '/politics/2016/aug/09/tom-watson-interview-jeremy-corbyn-labour-rifts-hug-shout', // Feature tone
    '/travel/2016/aug/09/diggerland-kent-family-day-trips-in-uk', // Review tone
    '/global/2016/aug/09/guardian-weekly-letters-media-statues-predators', // Letters tone
    '/commentisfree/2016/aug/08/the-guardian-view-on-the-southern-train-strike-keep-the-doors-open-for-talks', // Editorials tone
    '/lifeandstyle/shortcuts/2016/aug/09/why-truck-drivers-are-sick-of-chips-with-everything', // Features tone
    '/business/2016/aug/09/china-uk-investment-key-questions-following-hinkley-point-c-delay', // Analysis tone
    '/books/2011/aug/24/jorge-luis-borges-google-doodle', // More on this story
    '/uk-news/2016/aug/09/southern-rail-strike-war-of-words-heats-up-on-second-day', // Story package / tone news
    '/football/2016/jul/10/france-portugal-euro-2016-match-report' // Match summary
];

validatorJs.fetchRelease().then(checkEndpoints(false)).catch(onError);
validatorJs.fetchPreRelease().then(checkEndpoints(true)).catch(onError);

function checkEndpoints(devChannel) {
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
            console.log(`Checking the AMP validity (${devChannel ? 'pre-release' : 'release'}) of the page at ${endpoint}, result is:`);
            const result = validator.validateString(res);

            const pass = result.status === 'PASS';
            (pass ? console.log : console.error)(result.status);
            result.errors.forEach(error => {
                ((error.severity === 'ERROR') ? console.error : console.warn)(buildErrorMessage(error));
            });

            return pass;
    }).catch(onError);
}

function onError(error) {
    console.error(error.message);
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
