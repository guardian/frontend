const { fetch, getEndpointsFromResponse } = require("./endpoints/ophan");
const run = require("./run");

const sections = [
    "technology",
    "lifeandstyle",
    "money",
    "travel",
    "education",
    "politics",
    "science",
    "media",
    "music",
    "football",
    "sport",
    "games",
    "stage",
    "artanddesign",
    "film",
    "books",
    "business",
    "society",
    "environment"
];
const keywordTags = ["info%2Fseries%2Fdigital-blog"];
const filterOut = "ng-interactive|picture";
const fetchPath = path => fetch(path).then(getEndpointsFromResponse);

Promise.all([
    fetchPath(`/api/mostread?count=30`),
    ...keywordTags.map(keywordTag =>
        fetchPath(`/api/mostread/keywordtag/${keywordTag}?count=25`)
    ),
    ...sections.map(section => fetchPath(`/api/mostread/${section}?count=25`))
])
    .then(urlArrays => [].concat(...urlArrays)) // Flatten the array of arrays of paths
    .then(urls => urls.filter(url => !url.match(filterOut))) // Filter out unsupported urls
    .then(
        run({
            checkIfAmp: true,
            logErrors: false,
            checkIfDotComponents: true
        })
    )
    .catch(err => console.log(err));
