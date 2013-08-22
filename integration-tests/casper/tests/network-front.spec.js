/* global window, document */
'use strict';

/**
 *
 * Network front feature tests 
 *
 **/
var casper = require('casper').create(),
    host = casper.cli.get('host') || "http://m.code.dev-theguardian.com/";

casper.start(host);

var clearLocalStorage = function() {
    casper.evaluate(function() { window.localStorage.clear(); });
};

/**
 * Scenario Outline: Users can view more top stories for a section
 * Given I visit the network front
 * Then the '<section>' section should have a 'Show more' cta that loads in more top stories
 * 
 * Examples:
 *    | section         |
 *    | Sport           |
 *    | Comment is free |
 *    | Culture         |
 **/

casper.then(function() {
    casper.test.comment('Users can view more top stories for a section');

    var sections = ['Sport', 'Comment is free', 'Culture'];

    sections.forEach(function(section) {
        var sectionSelector = 'section[data-link-name*="' + section + '"]';

        casper.waitForSelector(sectionSelector + ' .cta',function(){

            casper.test.comment(section);

            casper.click(sectionSelector + ' .cta');

            casper.waitFor(function check() {
                return this.evaluate(function(selector) {
                    return document.querySelectorAll(selector + ' ul li').length > 5;
                }, sectionSelector);
            }, function then() {

                var trails = this.evaluate(function(selector) {
                    return document.querySelectorAll(selector + ' ul li').length;
                }, sectionSelector);


                this.test.assertTruthy(trails > 5, 'Then the ' + section + ' section should have a "Show more" cta that loads in more top stories');

            }, function timeout() {
                casper.test.fail('Failed to load more stories');
            });

        });
    });

});

/**
 * Scenario: Users can hide sections
 *    Given I visit the network front 
 *    When I hide a section
 *    Then the section will be hidden
 **/
casper.then(function() {
    casper.test.comment('Users can hide sections');

    clearLocalStorage();
    casper.reload();

    var btn = 'section[data-link-name*="Sport"] .toggle-trailblock',
        trailblock = 'section[data-link-name*="Sport"] .trailblock';

    casper.waitForSelector(btn,function(){
        casper.click(btn);
        this.test.assertEquals(this.getElementBounds(trailblock).height, 0, 'When I hide a section then the section will be hidden');
    });

});

/** 
 * Scenario: Users can show hidden sections
 *     Given I visit the network front
 *         And a section is hidden 
 *     When I show a section
 *     Then the section will be shown
 **/
casper.then(function() {
    casper.test.comment('Users can show hidden sections');

    var btn = 'section[data-link-name*="Sport"] .toggle-trailblock',
        trailblock = 'section[data-link-name*="Sport"] .trailblock';

    casper.waitForSelector(btn,function(){
        casper.click(btn);
        this.test.assertTruthy(this.getElementBounds(trailblock).height > 0, 'When I show a section then the section will be shown');
    });

});

/** 
 * Scenario: Hidden section will remain hidden on refresh
 *     Given I visit the network front
 *         And a section is hidden
 *     When I refresh the page
 *     Then the section will remain hidden
 **/
casper.then(function() {
    casper.test.comment('Hidden section will remain hidden on refresh');

    var btn = 'section[data-link-name*="Sport"] .toggle-trailblock',
        trailblock = 'section[data-link-name*="Sport"] .trailblock';

    clearLocalStorage();
    casper.reload();

    casper.waitForSelector(btn,function(){
        casper.click(btn);
        casper.waitFor(function check() {
            return this.getElementBounds(trailblock).height === 0;
        }, function then() {
            casper.reload(function() {
                this.test.assertEquals(this.getElementBounds(trailblock).height, 0, 'When I refresh the page then the section will remain hidden');
                casper.click(btn);
            });
        }, function timeout() {
            casper.test.fail('Failed to keep section hidden');
        });

    });

});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('save') || false);
});
