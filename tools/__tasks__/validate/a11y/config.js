const port = 9000;
const domain = 'localhost';

module.exports = {
    domain,
    host: `http://${domain}:${port}`,
    port,
    options: {
        level: 'error',
    },
    paths: ['politics/2013/oct/31/universal'],
    logLevel: 1, // 1: error, 2: warning, 3: notice
};
