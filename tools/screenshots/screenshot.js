/**
 * TODO
 *     * target particular elements
 */
var system = require('system'),
    environment = system.env.ENVIRONMENT,
    host = {
            prod: 'www.theguardian.com',
            code: 'm.code.dev-theguardian.com',
            dev: 'localhost:9000'
    }[environment],
    timestampDir = require('moment')().format('YYYY/MM/DD/HH:mm:ss')
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

casper.echo('Running tests against ' + environment + ' environment');
casper.echo('Environment host is ' + host);

casper.start(host, function() { })
    .each(urls, function(self, url) {
        // open our pages
        casper.echo('url is '+ host + url + '?view=mobile');
        this.thenOpen(host + url + '?view=mobile', {
        method: 'get'
    }, function() {
            // take screenshot over the breakpoints
            for(var breakpoint in breakpoints) {
                // create closure to maintain reference to breakpoint variable
                (function(that, url, breakpoint) {
                    that.then(function() {
                        that.viewport(breakpoints[breakpoint], 1).then(function() {
                            that.echo('Capturing "' + url + '" @ ' + breakpoint + ' breakpoint');
                            that.capture(screenshotsDir + '/' + url + '/' + breakpoint + '/' + timestampDir + '.png');
                        });
                    });
                })(this, url, breakpoint);
            };
        });
    });

casper.run();
