/* global window, document */
'use strict';

var collection = '.collection--sport',
    button = collection + ' .collection__display-toggle',
    clearLocalStorage = function(casper) {
        casper.evaluate(function() { window.localStorage.clear(); });
    };

/**
 *
 * Network front feature tests
 *
 **/
casper.start('http://www.theguardian.com/uk?view=mobile');

casper.thenOpen('http://www.theguardian.com/uk?view=mobile', {
    method: 'get',
    headers: {
        'X-Gu-Facia':'true'
    }
});

/**
 * Scenario: Users can hide collections
 *    Given I visit the network front
 *    When I hide a collection
 *    Then the collection will be hidden
 **/
casper.test.begin('Users can hide collections', function(test) {
    casper.then(function() {
        clearLocalStorage(this);
        this.reload();
    });
    casper.waitForSelector(button, function() {
        this.click(button);
    });
    casper.waitWhileVisible(collection + ' .items', function() {
        test.assertNotVisible(collection + ' .items', 'collection is hidden');
        test.done();
    });
});

/**
* Scenario: Users can show hidden collections
*     Given I visit the network front
*         And a collection is hidden
*     When I show a collection
*     Then the collection will be shown
**/
casper.test.begin('Users can show hidden collections', function(test) {
    casper.waitForSelector(button, function(){
        this.click(button);
    });
    casper.waitUntilVisible(collection + ' .items', function(){
        test.assertVisible(collection + ' .items', 'collection is shown');
        test.done();
    });
});

/**
* Scenario: Collection state remembers user's preference
*    Given I've previously closed a collection on the network front
*    When I visit the network front
*    Then the collection should be closed
**/
casper.test.begin('Collections remember user\'s preference of state', function(test) {
    casper.then(function() {
        clearLocalStorage(this);
        this.reload();
    });
    casper.waitForSelector(button, function(){
        this.click(button);
        this.reload();
    });
    casper.waitWhileVisible(collection + ' .items', function(){
        test.assertNotVisible(collection + ' .items', 'collection is hidden');
        test.done();
    });
});

/**
* Scenario: Can show more items in collection
*    Given I visit the network front
*        And a collection has hidden items
*    When I click 'Show More'
*    Then hidden items should be show
**/
casper.test.begin('Users can show more items in a collection', function(test) {
    var showMoreSelector = '.collection--news .items__show-more';
    casper.waitForSelector(showMoreSelector, function() {
        var currentItemsShown = this.evaluate(function() { return document.querySelectorAll('.collection--news .item:not(.u-h)').length; })
        this.click(showMoreSelector);
        test.assertNotEquals('.collection--news .item:not(.u-h)', currentItemsShown, 'showing more items');
        test.done();
    });
});

/**
* Scenario: First item in each collection has an image
*    Given I visit the network front
*    Then the first item in each collection should have an image
**/
casper.test.begin('First item in a collection displays an image', function(test) {
    casper.waitForSelector('.collection .item--image-upgraded', function(){
        test.assertExists('.collection .item--image-upgraded', 'item\'s image shown');
        test.done();
    });
});

/**
* Scenario: Timestamps relativise
*    Given I visit the network front
*    Then I should see relative timestamps
**/
casper.test.begin('Timestamps are relative', function(test) {
    casper.then(function() {
        console.log(this.fetchText('.timestamp__text'));
        console.log(this.getElementAttribute('.timestamp__text', 'title'));
        test.assertNotEquals(
            this.fetchText('.timestamp__text'),
            this.getElementAttribute('.timestamp__text', 'title'),
            'timestamp relativised'
        );
        test.done();
    });
});

/**
* Scenario: Items display comment counts
*    Given I visit the network front
*    Then I should see the comment count for an item
**/
casper.test.begin('Items display their comment count', function(test) {
    casper.waitForSelector('.trail__count--commentcount', function(){
        test.assertExists('.trail__count--commentcount', 'comment count exists');
        test.done();
    });
});

/**
* Scenario: Popular collection appears at the bottom of the page
*    Given I visit the network front
*    Then I should see the popular collection
**/
casper.test.begin('Popular collection appears at the bottom of the page', function(test) {
    casper.waitForSelector('.collection--popular', function(){
        test.assertExists('.collection--popular', 'popular collection displayed');
        test.done();
    });
});

casper.run(function() {
    casper.test.renderResults(true, 0, this.cli.get('xunit') + 'network-front.xml');
});
