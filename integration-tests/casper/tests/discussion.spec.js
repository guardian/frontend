/* global document */
'use strict';

/**
 *
 * Discussion feature tests 
 *
 **/
casper.start(host + 'world/2013/jun/06/obama-administration-nsa-verizon-records');

/**
 *   Scenario: Read top level comments
 *     Given I am on an article with comments
 *     When I choose to view the comments
 *     Then the main image has a toggle class applied to it
 *     Then I can see 10 top level comments
 *     And the first comment is authored by "tenacity"
 **/
casper.then(function() {

    casper.test.comment('Read top level comments');

    casper.click('.js-show-discussion');

    casper.waitForSelector('.d-discussion',function(){

        this.test.assertEvalEquals(function() {

            return document.querySelectorAll('.d-comment--top-level').length;

        }, 10, 'Then I can see 10 top level comments');


        this.test.assertSelectorHasText('.d-comment__author', 'tenacity', 'And the first comment is authored by "tenacity"');

    },function timeout(){
        casper.test.fail('Comments failed to load');
    });

});

/**
 *   Scenario: Read top level comments
 *     Given I am on an article with comments
 *     When I show more comments
 *     Then I can see 20 top level comments
 **/
casper.then(function() {

    casper.test.comment('Read top level comments');

    casper.click('.js-show-more-comments');

    this.waitFor(function check() {

        return this.evaluate(function(){

            return document.querySelectorAll('.d-comment--top-level').length === 20;

        });

    }, function then(){

        this.test.assertEvalEquals(function() {

            return document.querySelectorAll('.d-comment--top-level').length;

        }, 20, 'Then I can see 20 top level comments');

    }, function timeout(){
        casper.test.fail('Comments failed to load');
    });

});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('save') || false);
});

