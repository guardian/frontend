var container = '.container:nth-child(2)',
    button = container + ' .container__toggle';

/**
 *
 * Network front feature tests
 *
 **/
casper.test.setUp(function() {
    casper.start(host + 'uk?view=mobile', function() {
        clearLocalStorage();
    });
});

/**
 * Scenario: Users can hide container
 *    Given I visit the network front
 *    When I hide and show a container
 *    Then the container will be hidden and shown
 **/
casper.test.begin('Users can hide and show container', function(test) {
    casper.waitForSelector(button, function() {
        this.click(button);
        test.assertNotVisible(container + ' .collection', 'container is hidden');
        this.click(button);
        test.assertVisible(container + ' .collection', 'container is shown');
    });

    casper.run(function() {
        test.done();
    })
});

/**
* Scenario: Container state remembers user's preference
*    Given I've previously closed a container on the network front
*    When I visit the network front
*    Then the container should be closed
**/
casper.test.begin('Containers remember user\'s preference of state', function(test) {
    casper.waitForSelector(button, function(){
        this.click(button);
        this.reload();
    });
    casper.waitWhileVisible(container + ' .collection', function(){
        test.assertNotVisible(container + ' .collection', 'container is hidden');
    });

    casper.run(function() {
        test.done();
    })
});

/**
* Scenario: Can show more items in a collection
*    Given I visit the network front
*        And a collection has hidden items
*    When I click 'Show More'
*    Then hidden items should be show
**/
casper.test.begin('Users can show more items in a collection', function(test) {
    var showMoreButton = '.container .collection__show-more';
    casper.waitForSelector(showMoreButton, function() {
        var currentItemsShown = this.evaluate(function() { return document.querySelectorAll('.container .item').length; })
        this.click(showMoreButton);
        test.assertNotEquals('.container .item', currentItemsShown, 'showing more items');
    });

    casper.run(function() {
        test.done();
    })
});

/**
* Scenario: First item in a collection has an image
*    Given I visit the network front
*    Then the first item in a collection should have an image
**/
/*
casper.test.begin('First item in a collection displays an image', function(test) {
    var itemSelector = '.container:first-child .item:first-child.item--has-image';
    casper.thenBypassUnless(function() {
        return this.exists(itemSelector);
    }, 1);
    casper.waitForSelector(itemSelector + ' img', function() {
        test.assertExist(itemSelector + ' img', 'item\'s image shown');
    });

    casper.run(function() {
        test.done();
    })
});
*/

/**
* Scenario: Timestamps relativise
*    Given I visit the network front
*    Then I should see relative timestamps
**/
casper.test.begin('Timestamps are relative', function(test) {
    casper.then(function() {
        test.assertTruthy(this.getElementAttribute('.timestamp__text', 'title'), 'timestamp relativised');
    });

    casper.run(function() {
        test.done();
    })
});

/**
* Scenario: Items display comment counts
*    Given I visit the network front
*    Then I should see the comment count for an item
**/
/*
casper.test.begin('Items display their comment count', function(test) {
    casper.waitForSelector('.trail__count--commentcount', function(){
        test.assertExists('.trail__count--commentcount', 'comment count exists');
    });

    casper.run(function() {
        test.done();
    })
});
*/

/**
* Scenario: Popular container appears at the bottom of the page
*    Given I visit the network front
*    Then I should see the popular container
**/
casper.test.begin('Popular container appears at the bottom of the page', function(test) {
    var popContainerSelector = '.container--popular';
    casper.waitForSelector(popContainerSelector, function(){
        test.assertExists(popContainerSelector, 'popular container displayed');
        test.assertElementCount(popContainerSelector+ ' .item', 5, 'first five items visible');
    });

    casper.run(function() {
        test.done();
    })
});
