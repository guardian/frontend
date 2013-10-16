/* global document */
'use strict';

/**
 *
 * Search feature tests
 *
 **/

var casper = require('casper').create();

casper.start(host + "commentisfree/2013/oct/15/mums-carers-treated-like-criminals-hidden-cameras?view=mobile");

casper.test.begin("Load search", function(test){
    casper.waitUntilVisible('.control--search', function() {

        casper.click(".control--search");

        casper.waitUntilVisible('.nav-popup-search', function() {
            test.assertVisible('.nav-popup-search','Then I see the search bar when I click on the search icon');
            test.done();
        }, function timeout() {
            test.fail('Failed to transclude search component');
        });

    }, function timeout() {
        test.fail('No search icon found on page');
    });
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "most-popular.xml");
});
