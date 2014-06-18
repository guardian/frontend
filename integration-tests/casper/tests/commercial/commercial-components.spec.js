var config = {
    // TODO: get commercial components working on dev for real
    selector: environment === 'dev' ? '.ad-slot--commercial-component iframe' : '.ad-slot--commercial-component > .commercial'
};

/**
 * Scenario: Low profile commercial component displays on article pages
 *    Given I visit an article
 *    Then I should see a low profile commercial component at the bottom of the page
 */
casper.test.begin('Low profile commercial component displays on article pages', function(test) {

    casper.start(host + 'lifeandstyle/wordofmouth/2014/apr/07/food-and-drink-tesco-opens-ny-style-restaurant');

    casper.waitForSelector(config.selector, function() {
        test.assertExists(config.selector);
    });

    casper.run(function() {
        test.done();
    })

});
