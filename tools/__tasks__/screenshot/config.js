// TODO: Vary on environment
const environment = 'dev'; // Hardcode this for the moment until we're running anywhere but local

const domain = {
    prod: 'theguardian.com',
    code: 'm.code.dev-theguardian.com',
    dev: 'localhost',
}[environment];

const port = {
    prod: '80',
    code: '80',
    dev: '9000',
}[environment];

const host = `http://${domain}:${port}/`;

// TODO: Add lots more useful paths - interactives, liveblogs, immersives etc
const paths = [
    'uk',
    'us',
    'au',
];

module.exports = {
    environment,
    domain,
    port,
    host,
    paths,
    breakpoints: {
        wide: 1300,
        desktop: 980,
        tablet: 740,
        mobile: 320,
    },
    screenshotsDir: 'screenshots',
};
