/**
 * TODO
 *     * use casper for promises? async?
 *     * allow multiple urls/viewport sizes
 *     * target particular elements
 *     * wait for ajax
 */
var host   = 'http://www.theguardian.com/',
    urls   = ['uk', 'us'],
    casper = require('casper').create();

//phantom.addCookie({
//    name: 'GU_FACIA',
//    value: 'true',
//    domain: 'www.theguardian.com'
//})


casper.start().each(urls, function(self, url) {
    this.thenOpen(host + url, function() {
        this.capture('screenshots/' + url +  + '.png', {
            top: 0,
            left: 0,
            width: 1200,
            height: 1000
        });
    });
});

casper.run();
