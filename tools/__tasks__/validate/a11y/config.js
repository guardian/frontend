const port = 9000;
const domain = 'localhost';

module.exports = {
    domain,
    host: `http://${domain}:${port}`,
    port,
    options: {
        level: 'error',

        // Issue: https://github.com/pa11y/pa11y/issues/335
        htmlcs: 'http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js',
    },
    paths: [
        'politics/2013/oct/31/universal',
        'sport/live/2018/may/05/kentucky-derby-2018-mendelssohn-live',
        'world/2017/aug/24/the-school-beneath-the-wave-the-unimaginable-tragedy-of-japans-tsunami',
    ],
    logLevel: 1, // 1: error, 2: warning, 3: notice
};
