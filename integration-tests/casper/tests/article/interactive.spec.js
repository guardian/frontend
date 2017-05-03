/* global document */
'use strict';

/**
 *
 * Interactive feature tests
 *
 **/

var casper = require('casper').create();

casper.start(host + "music/interactive/2013/aug/20/matthew-herbert-quiz-hearing?view=mobile");

casper.test.begin("Display interactive content", function(test) {
    casper.waitForSelector('figure.interactive *', function() {
        test.assertEquals(document.querySelectorAll('.GI_BL_wrapper').length, 1, 'Content is transcluded');
        test.assertEquals(document.querySelectorAll('figure.interactive>link').length, 1, 'And styles are loaded');
        test.done();
    }, function timeout() {
        test.fail('Failed to transclude interactive');
    });
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "interactive.xml");
});
