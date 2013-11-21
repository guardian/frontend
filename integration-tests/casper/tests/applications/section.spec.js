/**
 *
 * Section page feature tests
 *
 **/
casper.test.setUp(function() {
    casper.start(host + 'football?view=mobile', function() {
        clearLocalStorage();
    });
});

/**
* Scenario: Popular container appears at the bottom of the page
*    Given I visit a section page
*    Then I should see the popular container
**/
casper.test.begin('Popular container appears at the bottom of the page', function(test) {
    casper.then(function testSectionPopularContainer() {
        var popContainerSelector = '.container--popular';
        casper.waitForSelector(popContainerSelector, function(){
            test.assertElementCount(popContainerSelector, 1, 'exactly one popular container should be displayed');
            test.done();
        }, function timeout() {
            casper.capture(screens + 'section-popular-container-fail.png');
            test.fail('Section popular container not present');
        });
    });
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'section.xml');
});
