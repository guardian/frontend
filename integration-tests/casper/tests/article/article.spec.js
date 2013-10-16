/* global document */
'use strict';

/**
 *
 * Article feature tests
 *
 **/

var casper = require('casper').create();

casper.start(host + "business/2010/feb/08/fsa-european-directive-hedge-funds?view=mobile");

casper.test.begin("Display related content", function(test) {
    casper.waitForText('Related content', function() {
        casper.click('.js-related button');
        test.assertEquals(document.querySelectorAll('.js-related .related-trails.shut').length, 0, 'Button shows more related trails');
        test.done();
    }, function timeout() {
        test.fail('Failed to transclude related content');
    });
});


casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "article.xml");
});
