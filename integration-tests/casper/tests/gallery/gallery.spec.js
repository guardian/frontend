/* global document */
'use strict';

/**
 *
 * Gallery feature tests
 *
 **/

var casper = require('casper').create();

casper.start(host + "environment/gallery/2013/aug/28/wildlife-photographer-of-the-year-2013-in-pictures?view=mobile");

casper.test.begin("Display gallery contact sheet", function(test) {
    if (casper.exists('.gallerythumbs')) {
        test.assertVisible('.gallerythumbs__item');
        test.done();
    }
});



casper.test.begin("Display latest summary before events on small viewports", function(test) {
    if (casper.exists('.js-article__summary')) {
        casper.viewport(320, 480);
        test.assertNotVisible('[data-link-name="summary after content"]');
        test.assertVisible('[data-link-name="summary before content"]');
        test.done();
    }
});

casper.test.begin("Display latest summary on the right side of article on wide viewports", function(test) {
    if (casper.exists('.js-article__summary')) {
        casper.viewport(1024, 768);
        test.assertVisible('[data-link-name="summary after content"]');
        test.assertNotVisible('[data-link-name="summary before content"]');
        test.done();
    }
});


casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "gallery.xml");
});
