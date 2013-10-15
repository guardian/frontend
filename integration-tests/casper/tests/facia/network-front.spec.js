/* global window, document */
'use strict';

/**
 *
 * Network front feature tests
 *
 **/
casper.start(host + 'uk?view=mobile');

/**
 * Scenario: Users can hide sections
 *    Given I visit the network front
 *    When I hide a collection
 *    Then the collection will be hidden
 **/
casper.test.begin('Users can hide collections', {
    setUp: function() {
        clearLocalStorage();
        casper.reload();
    },
    test: function(test) {
        var collection = '.js-collection--display-toggle',
            btn = collection + ' .collection__display-toggle';

        casper.waitForSelector(btn, function(){
            test.assertEquals(this.getElementBounds(collection + ' .items').height, 0, 'When I hide a collection then the collection will be hidden');
            test.done();
        });
    }
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'network-front.xml');
});
