/**
 * TODO
 *     * allow multiple urls/viewport sizes
 *     * target particular elements
 */
var domains = {
        prod: 'www.theguardian.com',
        stage: 'm.code.dev-theguardian.com',
        dev: 'localhost'
    },
    urls   = ['uk', 'us', 'au'],
    stage = 'prod',
    domain = domains[stage],
    host = 'http://' + domain + '/',
    breakpoints = {
        mobile: 332,
        tablet: 732,
        desktop: 972,
        wide: 1292
    },
    casper = require('casper').create();

casper.start(host, function() {
    // add facia cookie
    var faciaCookie = {
        name: 'GU_FACIA',
        value : 'true',
        domain : domain
    };
    this.page.addCookie(faciaCookie);
}).each(urls, function(self, url) {
    // open our pages
    this.thenOpen(host + url + '?view=mobile', function() {
        // take screenshot over the breakpoints
        for(var breakpoint in breakpoints) {
            // create closure to maintain reference to breakpoint variable
            (function(that, url, breakpoint) {
                that.then(function() {
                    that.viewport(breakpoints[breakpoint], 1).then(function() {
                        that.echo('Capturing "' + url + '" @ ' + breakpoint + ' breakpoint');
                        that.capture('./screenshots/' + url.replace(/\//g, '|') + '-' + breakpoint + '.png');
                    });
                });
            })(this, url, breakpoint);
        };
    });
});

casper.run();
