const fetchEndpoints = require('./endpoints/ophan');
const run = require('./run');

fetchEndpoints.then(run({
    checkIfAmp: true,
    logErrors: false
}));
