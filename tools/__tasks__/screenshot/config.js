// TODO: Vary on environment
const environment = 'ci'; // Hardcode this for the moment until we're running anywhere but local

const domain = {
    prod: 'theguardian.com',
    code: 'm.code.dev-theguardian.com',
    dev: 'localhost',
    ci: 'localhost',
}[environment];

const port = {
    prod: '80',
    code: '80',
    dev: '9000',
    ci: '9000',
}[environment];

const host = `http://${domain}:${port}/`;

// TODO: Add lots more useful paths - interactives, liveblogs, immersives etc
const paths = {
    prod: ['uk', 'us', 'au'],
    code: ['uk', 'us', 'au'],
    dev: ['uk', 'us', 'au'],
    ci: [
        'books/2014/may/21/guardian-journalists-jonathan-freedland-ghaith-abdul-ahad-win-orwell-prize-journalism',
    ],
}[environment];

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
