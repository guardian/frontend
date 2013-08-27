/* global document */
'use strict';

/**
 *
 * Collections editor feature tests 
 *
 **/


var environment = "code",    
    target = {
        dev:  'http://localhost:9000',
        code: 'https://frontend.code.dev-gutools.co.uk'
    }[environment] + '/collections';

casper.start(target, function() {
    this.click('#login-button');

    casper.waitFor(function check() {
        return (this.getCurrentUrl().indexOf('https://accounts.google.com/ServiceLogin') === 0);
    });

    casper.then(function() {
        this.fill('#gaia_loginform', {
            'Email': 'test.automation@gutest.com',
            'Passwd': 'Setup001'    
        }, true);
    })

    casper.waitFor(
        function check() {
            return (this.getCurrentUrl() === target);
        }
    );

})

casper.then(function() {
    // TEST
    casper.test.comment('The login button is dropped');
    casper.test.assertDoesntExist('#login-button');

    // TEST
    casper.test.comment('The logout button is provided');
    casper.test.assertExists('#logout-button');
});

casper.thenOpen(target + '?blocks=test/news/masthead', function(){
    casper.test.comment('Open the "test/news/masthead" collection');
});

// TEST
casper.waitForSelector('[data-list-id="test/news/masthead"]', function(){
    casper.test.assertExists('[data-list-id="test/news/masthead"]');
});

casper.waitForSelector('[data-url="world/middle-east-live/2013/aug/27/syria-crisis-military-intervention-un-inspectors"]', function(){
    // TEST
    casper.test.assertExists('[data-url="world/middle-east-live/2013/aug/27/syria-crisis-military-intervention-un-inspectors"]');
});

casper.then(function() {
    casper.viewport(1024, 768);
    casper.captureSelector('body.png', 'body');
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('save') || false);
});

