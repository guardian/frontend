/* global document */
'use strict';

/**
 *
 * Collections editor feature tests
 *
 **/


var collectionId = 'test/dummy/collection',
    articleId = "world/middle-east-live/2013/aug/27/syria-crisis-military-intervention-un-inspectors",

    environment = "code",
    target = {
        dev: 'http://localhost:9000',
        code: 'https://frontend.code.dev-gutools.co.uk'
    }[environment];

// Set up authenticated user
casper.start(target + "/login", function () {


    var cookie = {
        'name': 'PLAY_SESSION',
        'value': 'a70cfdeedb56a857c15c5fc4c3aa2e80d313a671-identity%3A%7B%22openid%22%3A%22https%3A%2F%2Fwww.google.com%2Faccounts%2Fo8%2Fid%3Fid%3DAItOawnpjHRrbmul5z6VfDRpzzWjzQDsxedYVJk%22%2C%22email%22%3A%22test.automation%40gutest.com%22%2C%22firstName%22%3A%22test%22%2C%22lastName%22%3A%22automation%22%7D',
        'domain': "frontend.code.dev-gutools.co.uk",
        'path': '/',
        'httponly': false,
        'secure': false,
        'expires': (new Date()).getTime() + (1000 * 60 * 60)
    }


    this.page.addCookie(cookie);

})

casper.then(function () {
    this.open(target + "/collections").then(function () {
        casper.waitFor(
            function check() {
                return (this.getCurrentUrl() === target + "/collections");
            }
        );
    })
});

// Check the correct login/out buttons are present 
casper.then(function () {
    casper.test.comment('The login button isn\'t present');
    casper.test.assertDoesntExist('#login-button');

    casper.test.comment('The logout button is present');
    casper.test.assertExists('#logout-button');
});

// Check that a collection can be specified by a query param 
casper.thenOpen(target + '/collections' + '?blocks=' + collectionId, function () {
});
casper.waitForSelector('[data-list-id="' + collectionId + '"]', function () {
    casper.test.comment('The collection loads OK');
    casper.test.assertExists('[data-list-id="' + collectionId + '"]');
});

// 'drop' an article onto the clipboard
casper.then(function () {
    casper.evaluate(function () {
        var clipboard = document.querySelector('#clipboard'),
            event = document.createEvent("MouseEvents");

        event.initMouseEvent("drop", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        event.testData = articleId;
        clipboard.dispatchEvent(event);
    });
});
casper.waitForSelector('#clipboard [data-url="' + articleId + '"]', function () {
    casper.test.comment('The article drops into the clipboard');
    casper.test.assertExists('#clipboard [data-url="' + articleId + '"]');
});

casper.run(function () {
    this.test.renderResults(true, 0, this.cli.get('save') || false);
});

