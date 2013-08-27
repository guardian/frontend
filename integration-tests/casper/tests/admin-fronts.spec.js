/* global document */
'use strict';

/**
 *
 * Collections editor feature tests 
 *
 **/


var collectionId = 'test/dummy/collection',
    articleId = "world/middle-east-live/2013/aug/27/syria-crisis-military-intervention-un-inspectors",
    testAccEmail = 'test.automation@gutest.com',
    testAccPasswd = 'Setup001',    

    environment = "code",
    target = {
        dev:  'http://localhost:9000',
        code: 'https://frontend.code.dev-gutools.co.uk'
    }[environment] + '/collections';

// Set up authenticated user
casper.start(target, function() {
    this.click('#login-button');

    casper.waitFor(function check() {
        return (this.getCurrentUrl().indexOf('https://accounts.google.com/ServiceLogin') === 0);
    });

    casper.then(function() {
        this.fill('#gaia_loginform', {
            'Email':  testAccEmail,
            'Passwd': testAccPasswd    
        }, true);
    })

    casper.waitFor(
        function check() {
            return (this.getCurrentUrl() === target);
        }
    );

})

// Check the correct login/out buttons are present 
casper.then(function() {
    casper.test.comment('The login button isn\'t present');
    casper.test.assertDoesntExist('#login-button');

    casper.test.comment('The logout button is present');
    casper.test.assertExists('#logout-button');
});

// Check that a collection can be specified by a query param 
casper.thenOpen(target + '?blocks=' + collectionId, function(){});
casper.waitForSelector('[data-list-id="' + collectionId + '"]', function(){
    casper.test.comment('The collection loads OK');
    casper.test.assertExists('[data-list-id="' + collectionId + '"]');
});

// 'drop' an article onto the clipboard
casper.then(function(){
    casper.evaluate(function(){
        var clipboard = document.querySelector('#clipboard'), 
            event = document.createEvent("MouseEvents");

        event.initMouseEvent("drop", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        event.testData = articleId;
        clipboard.dispatchEvent(event);        
    });
});
casper.waitForSelector('#clipboard [data-url="' + articleId + '"]', function(){
    casper.test.comment('The article drops into the clipboard');
    casper.test.assertExists('#clipboard [data-url="' + articleId + '"]');
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('save') || false);
});

