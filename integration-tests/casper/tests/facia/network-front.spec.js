var container = 'section:nth-of-type(2)',
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

