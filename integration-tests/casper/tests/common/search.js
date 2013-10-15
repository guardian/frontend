/* global document */
'use strict';

/**
 *
 * Most popular feature tests
 *
 **/

var casper = require('casper').create();

casper.start(host + "commentisfree/2013/oct/15/mums-carers-treated-like-criminals-hidden-cameras?view=mobile");

casper.test.begin("Load search", function(test){

    casper.click(".control--search");

    casper.waitUntilVisible('.nav-popup-search', function() {
        test.assertVisible('.nav-popup-search',)
    }, function timeout() {
        test.fail('Failed to transclude most read component');
    });
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "most-popular.xml");
});
