const { fetch, getEndpointsFromResponse } = require('./endpoints/ophan');
const run = require('./run');

const sections = ['music', 'football'];
const fetchPath = path => fetch(path).then(getEndpointsFromResponse);

Promise.all(
    sections
        .map(section => fetchPath(`/api/mostread/${section}?count=25`))
        .concat(fetchPath(`/api/mostread?count=30`))
)
    .then(urlArrays => [].concat(...urlArrays)) // Flatten the array of arrays of paths
    .then(
        run({
            checkIfAmp: true,
            logErrors: false,
        })
    )
    .catch(err => console.log(err));
