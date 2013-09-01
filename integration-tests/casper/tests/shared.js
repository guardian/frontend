casper = require('casper').create();
system = require('system');
environment = system.env.ENVIRONMENT;
host = {
    dev:    'http://localhost:9000/',
    code:   'https://m.code.dev-theguardian.com/',
    prod:   'https://www.theguardian.com/'
}[environment];

casper.echo('Running tests against ' + environment + ' environment');
casper.echo('Environment host is ' + host);
