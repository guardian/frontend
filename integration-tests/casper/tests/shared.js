system = require('system');
environment = system.env.ENVIRONMENT;
host = {
    dev:    'http://localhost:9000/',
    code:   'http://m.code.dev-theguardian.com/',
    prod:   'http://www.theguardian.com/'
}[environment];

casper.echo('Running tests against ' + environment + ' environment');
casper.echo('Environment host is ' + host);

clearLocalStorage = function() {
    casper.evaluate(function() { window.localStorage.clear(); });
};
