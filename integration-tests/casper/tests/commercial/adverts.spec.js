var config = {
    selector: '.container .ad-slot'
};

/**
 * Scenario: Two adverts are displayed in containers on fronts
 *    Given I visit the network front
 *    Then I should see two adverts in the containers
 */
casper.test.begin('Two adverts are displayed in containers on fronts', function(test) {

    casper.start(host + 'uk');

    casper.waitForSelector(config.selector, function() {
        test.assertElementCount(config.selector, 2);
    });

    casper.run(function() {
        test.done();
    })

});
