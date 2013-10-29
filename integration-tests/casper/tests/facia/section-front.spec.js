/**
 *
 * Network front feature tests
 *
 **/
casper.test.setUp(function() {
    casper.start(host + 'uk/culture?view=mobile', function() {
        clearLocalStorage();
    });
});

/**
* Scenario: Popular collection appears at the bottom of the page
*    Given I visit the network front
*    Then I should see the popular collection
**/
casper.test.begin('Popular collection appears at the bottom of the page', function(test) {
    casper.waitForSelector('.collection--popular', function(){
        test.assertElementCount('.collection--popular', 1, 'exactly one popular collection should be displayed');
    });

    casper.run(function() {
        test.done();
    })
});
