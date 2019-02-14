const { fetch, getEndpointsFromResponse } = require('./endpoints/ophan');
const run = require('./run');

const sections = ['music', 'football'];
const keywordTags = ['info%2Fseries%2Fdigital-blog'];
const fetchPath = path => fetch(path).then(getEndpointsFromResponse);

Promise.all([
    fetchPath(`/api/mostread?count=30`),
    ...keywordTags.map(keywordTag =>
        fetchPath(`/api/mostread/keywordtag/${keywordTag}?count=25`)
    ),
    ...sections.map(section => fetchPath(`/api/mostread/${section}?count=25`)),
])
    .then(urlArrays => [].concat(...urlArrays)) // Flatten the array of arrays of paths
    .then(
        run({
            checkIfAmp: true,
            logErrors: false,
        })
    )
    .catch(err => console.log(err));
