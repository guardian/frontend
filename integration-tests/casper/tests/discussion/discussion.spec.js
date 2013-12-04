/* global document */
'use strict';

/**
 * Discussion feature tests
 */

casper.test.setUp(function() {
    casper.start(host +'science/grrlscientist/2012/aug/07/3?view=mobile');
    casper.options.waitTimeout = 10000;
});

/**
 *   Scenario: Read top level comments
 *     Given I am on an article with comments
 *     Then I can see the comments
 * 
 **/
casper.test.begin('Read top level comments', function(test) {
    casper.waitForSelector('.d-discussion', function then() {
        test.assertExists('.d-discussion');
        test.assertVisible('.d-discussion');
        test.done();
    }, function timeout() {
        casper.capture(screens + 'discussion-fail.png');
        test.fail('Comments failed to load');
    });
});

casper.test.begin('Show more comments', function (test) { // Testing on an article with topComments present
    
    var showCta = '.discussion__comments__container .d-show-cta',
        commentLi = '.discussion__comments__container li.d-comment--top-level';

    casper.waitForSelector('.discussion__comments__container', function then () {
        test.assertExists('.discussion__comments__container');
        test.assertVisible('.discussion__comments__container');
        test.assertExists(showCta);
        test.assertVisible(showCta);
        test.assertElementCount(commentLi, 10);
        test.assertEval(function () {
            return document.querySelector('.discussion__comments__container li.d-comment--top-level').className.match(/(u-h)/).length > 1;
        }, "Comment Li's should not have u-h class");
        casper.click(showCta);
        casper.waitFor(function check () {
            return this.evaluate(function () {
                return document.querySelector('.discussion__comments__container li.d-comment--top-level').className.match(/(u-h)/) === null; // Only checks one - should check all
            });
        }, function then () {
            test.assertVisible(commentLi);
            test.assertEval(function () {
                return document.querySelector('.discussion__comments__container .d-show-cta').className.match(/(u-h)/).length > 1;
            }, "Show CTA should not have u-h class");
        });

    });
});

// casper.test.begin('Hash comment permalink links to relevant comment', function(test) {
//     casper.thenOpen(host +'football/2013/sep/25/manchester-united-liverpool-capital-one-cup#comment-27353447', function() {
//         casper.waitForSelector('#comment-27353447', function then() {
//             test.assertExists('#comment-27353447');
//             test.assertVisible('#comment-27353447');
//             test.assertVisible('.d-discussion__show-more--newer');
//             test.assertVisible('.d-discussion__show-more--older');
//             test.done();
//         }, function timeout() {
//             casper.capture(screens + 'discussion-permalink-fail.png');
//             test.fail('Permalink failed to load comment');
//         })
//     });
// });

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'discussion.xml');
});