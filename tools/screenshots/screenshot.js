/**
 * TODO
 *     * target particular elements
 */
var environment = require('system').env.ENVIRONMENT,
    host = {
            prod: 'www.theguardian.com',
            code: 'm.code.dev-theguardian.com',
            dev: 'localhost:9000'
    }[environment],
    timestampDir = require('moment')().format('YYYY/MM/DD/HH:mm:ss'),
    urls   = ['uk', 'us', 'au'],
    host = 'http://' + host + '/',
    breakpoints = {
        wide: 1300,
        desktop: 980,
        tablet: 740,
        mobile: 320
    },
    screenshotsDir = './screenshots',
    casper = require('casper').create();


casper.start(host, function() {
    this.echo('Running tests against `' + environment + '` environment');
});

casper.each(urls, function(casper, url) {
    this.each(Object.keys(breakpoints), function(casper, breakpoint) {
        this.then(function() {
            this.viewport(breakpoints[breakpoint], 1);
        });
        this.thenOpen(host + url + '?view=mobile', function() {
            // need better 'fully loaded' trigger
            this.wait(5000);
        });
        this.then(function() {
            this.echo('Capturing ' + host +  url + ' @ ' + breakpoint + ' breakpoint')
                .capture(screenshotsDir + '/' + url + '/' + breakpoint + '/' + timestampDir + '.png');
        });
    });
});

casper.run();
