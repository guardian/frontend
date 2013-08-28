/**
 * TODO
 *     * use casper for promises? async?
 *     * allow multiple urls/viewport sizes
 *     * target particular elements
 *     * wait for ajax
 */
var host = 'http://www.theguardian.com/',
    url  = 'uk?view=mobile';

var WebPage = require('webpage');
page = WebPage.create();

phantom.addCookie({
    name: 'GU_FACIA',
    value: 'true',
    domain: 'www.theguardian.com'
})

page.viewportSize = { width: 1200, height: 10 };
page.open(host + url);
page.onLoadFinished = function() {
   page.render('screenshots/a-page-' + page.viewportSize.width + 'x' + page.viewportSize.height + '.png');
   phantom.exit();
}