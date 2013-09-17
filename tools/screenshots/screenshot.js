/**
 * TODO
 *     * target particular elements
 */

system = require('system');
environment = system.env.ENVIRONMENT;
host = {
        prod: 'www.theguardian.com',
        code: 'm.code.dev-theguardian.com',
        dev: 'localhost:9000'
}[environment];

casper.echo('Running tests against ' + environment + ' environment');
casper.echo('Environment host is ' + host);

    urls   = ['uk', 'us', 'au'],
    host = 'http://' + host + '/';
    breakpoints = {
        wide: 1292,
        desktop: 972,
        tablet: 732,
        mobile: 332
    },
    screenshotsDir = './screenshots',
    casper = require('casper').create();



casper.start(host, function() {
}).each(urls, function(self, url) 
{
    // open our pages
    casper.echo('url is '+ host + url + '?view=mobile');
    this.thenOpen(host + url + '?view=mobile', {
    method: "get",
   //enable facia
    headers: {
      'X-Gu-Facia':'true'       
    }
},function() {
        // take screenshot over the breakpoints
        for(var breakpoint in breakpoints) {
            // create closure to maintain reference to breakpoint variable
            (function(that, url, breakpoint) {
                that.then(function() {
                    that.viewport(breakpoints[breakpoint], 1).then(function() {
                        that.echo('Capturing "' + url + '" @ ' + breakpoint + ' breakpoint');
                        that.capture(screenshotsDir + '/' + url.replace(/\//g, '|') + '-' + breakpoint + '.png');
                    });
                });
            })(this, url, breakpoint);
        };
    });
});




casper.run();
