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
* Scenario: Popular container appears at the bottom of the page
*    Given I visit the network front
*    Then I should see the popular container
**/
casper.test.begin('Popular collection appears at the bottom of the page', function(test) {
    var popContainerSelector = '.container--popular';
    casper.waitForSelector(popContainerSelector, function(){
        test.assertElementCount(popContainerSelector, 1, 'exactly one popular container should be displayed');
    });

    casper.run(function() {
        test.done();
    })
});
