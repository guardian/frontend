/* global document */
'use strict';

/**
 *
 * Discussion feature tests 
 *
 **/
casper.start(host + '/science/grrlscientist/2012/aug/07/3?view=mobile');


/**
 *   Scenario: Read top level comments
 *     Given I am on an article with comments
 *     When I choose to view the comments
 *     Then the main image has a toggle class applied to it
 *     Then I can see 10 top level comments
 *     And the first comment is authored by "helenf888"
 **/
// Check the correct login/out buttons are present
casper.test.begin('Read top level comments', function(test) {
    casper.waitForSelector('.d-discussion',
        function then() {
            test.assertEvalEquals(function() {
                return document.querySelectorAll('.d-comment--top-level').length;
            }, 10, 'Then I can see 10 top level comments');

            test.assertSelectorHasText('.d-comment__author', 'helenf888', 'And the first comment is authored by "helenf888"');
            test.done();
        },
        function timeout() {
            test.fail('Comments failed to load');
        }
    );
    test.done();
});

/*
 *   Scenario: Read top level comments
 *     Given I am on an article with comments
 *     When I show more comments
 *     Then I can see 20 top level comments
 */
casper.test.begin('Show more comments', function(test) {
    casper.waitFor(
        function check() {
            return casper.evaluate(function(){
                return document.querySelectorAll('.d-comment--top-level').length === 20;
            });
        },
        function then(){
            test.assertEvalEquals(function() {
                return document.querySelectorAll('.d-comment--top-level').length;
            }, 20, 'Then I can see 20 top level comments');

            test.done();
        },
        function timeout(){
            test.fail('Comments failed to load');
        }
    );
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit'));
});
