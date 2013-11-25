/**
 * TODO
 *     * target particular elements
 */
var environment = require('system').env.ENVIRONMENT,
    domain = {
        prod: 'www.theguardian.com',
        code: 'm.code.dev-theguardian.com',
        dev: 'localhost:9000'
    }[environment],
    host = 'http://' + domain + '/',
    urls   = [
        'uk',
        'us',
        'au',
        'business/2013/nov/19/co-op-group-chairman-len-wardle-resigns-scandal'
    ],
    breakpoints = {
        wide: 1300,
        desktop: 980,
        tablet: 740,
        mobile: 320
    },
    timestampDir = require('moment')().format('YYYY/MM/DD/HHmm.X'),
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
        this.thenOpen(host + url + '?view=mobile');
        this.then(function() {
            this.echo('Capturing ' + host +  url + ' @ ' + breakpoint + ' breakpoint')
                .capture(screenshotsDir + '/' + encodeURIComponent(url) + '/' + breakpoint + '/' + timestampDir + '.png');
        });
    });
});

casper.run();
