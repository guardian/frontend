const endpoints = require('./endpoints/fixed');
const run = require('./run');

run({
    checkIfAmp: false,
    logErrors: true
})(endpoints);
