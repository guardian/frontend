/* global window, document */
'use strict';

/**
 *
 * Network front feature tests 
 *
 **/
casper.start(host + 'uk?view=mobile');

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
casper.test.begin('Users can view more top stories for a section', function(test) {

    var sections = ['Sport', 'Comment is free', 'Culture'];

    sections.forEach(function(section, i) {
        var sectionSelector = 'section[data-link-name*="' + section + '"]';

        casper.waitForSelector(sectionSelector + ' .cta',function(){

            test.comment(section);

            casper.click(sectionSelector + ' .cta');

            casper.waitFor(function check() {
                return this.evaluate(function(selector) {
                    return document.querySelectorAll(selector + ' ul li').length > 5;
                }, sectionSelector);
            }, function then() {

                var trails = this.evaluate(function(selector) {
                    return document.querySelectorAll(selector + ' ul li').length;
                }, sectionSelector);

                test.assertTruthy(trails > 5, 'Then the ' + section + ' section should have a "Show more" cta that loads in more top stories');
                test.done();
            }, function timeout() {
                test.fail('Failed to load more stories');
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
casper.test.begin('Users can hide sections', {
    setUp: function() {
        clearLocalStorage();
        casper.reload();
    },
    test: function(test) {
        var btn = 'section[data-link-name*="Sport"] .toggle-trailblock',
            trailblock = 'section[data-link-name*="Sport"] .trailblock';

        casper.waitForSelector(btn, function(){
            casper.click(btn);
            test.assertEquals(this.getElementBounds(trailblock).height, 0, 'When I hide a section then the section will be hidden');
            test.done();
        });
    }
});

/** 
 * Scenario: Users can show hidden sections
 *     Given I visit the network front
 *         And a section is hidden 
 *     When I show a section
 *     Then the section will be shown
 **/
casper.test.begin('Users can show hidden sections', function(test) {

    var btn = 'section[data-link-name*="Sport"] .toggle-trailblock',
        trailblock = 'section[data-link-name*="Sport"] .trailblock';

    casper.waitForSelector(btn,function(){
        casper.click(btn);
        test.assertTruthy(this.getElementBounds(trailblock).height > 0, 'When I show a section then the section will be shown');
        test.done();
    });

});

/** 
 * Scenario: Hidden section will remain hidden on refresh
 *     Given I visit the network front
 *         And a section is hidden
 *     When I refresh the page
 *     Then the section will remain hidden
 **/
casper.test.begin('Hidden section will remain hidden on refresh', {
    setUp: function() {
        clearLocalStorage();
        casper.reload();
    },
    test: function(test) {
        var btn = 'section[data-link-name*="Sport"] .toggle-trailblock',
            trailblock = 'section[data-link-name*="Sport"] .trailblock';

        casper.waitForSelector(btn,function(){
            casper.click(btn);
            casper.waitFor(function check() {
                return this.getElementBounds(trailblock).height === 0;
            }, function then() {
                casper.reload(function() {
                    test.assertEquals(this.getElementBounds(trailblock).height, 0, 'When I refresh the page then the section will remain hidden');
                    casper.click(btn);
                    test.done();
                });
            }, function timeout() {
                test.fail('Failed to keep section hidden');
            });

        });
    }
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'network-front.xml');
});
