/* global window, document */
'use strict';

/**
 *
 * Network front feature tests
 *
 **/
casper.start(host + 'uk?view=mobile');

/**
 * Scenario: Users can hide collections
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
        var collection = '.collection--sport',
            button = collection + ' .collection__display-toggle';

        casper.waitForSelector(button, function(){
            this.click(button);
            test.assertFalse(this.visible(collection + ' .items'), 'When I hide a collection then the collection will be hidden');
            test.done();
        });
    }
});

/**
 * Scenario: Users can show hidden collections
 *     Given I visit the network front
 *         And a collection is hidden
 *     When I show a collection
 *     Then the collection will be shown
 **/
casper.test.begin('Users can show hidden sections', function(test) {

    var collection = '.collection--sport',
        button = collection + ' .collection__display-toggle';

    casper.waitForSelector(button, function(){
        casper.click(button);
        test.assertTrue(this.visible(collection + ' .items'), 'When I show a collection then the collection will be shown');
        test.done();
    });

});

/**
 * Scenario: Collection state should remember user's preference
 *    Given I've previously closed a collection on the network front
 *    When I visit the network front
 *    Then the collection should be closed
 **/
casper.test.begin('Users can hide collections', {
    setUp: function() {
        clearLocalStorage();
        casper.reload();
    },
    test: function(test) {
        var collection = '.collection--sport',
            button = collection + ' .collection__display-toggle';

        casper.waitForSelector(button, function(){
            this.click(button);
        });
        casper.reload();
        casper.waitForSelector(button, function(){
            test.assertFalse(this.visible(collection + ' .items'), 'When I show a collection then the collection will be shown');
            test.done();
        });
    }
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'network-front.xml');
});
