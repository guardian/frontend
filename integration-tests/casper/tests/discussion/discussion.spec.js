/* global document */
'use strict';

/**
 *
 * Discussion feature tests 
 *
 **/

casper.test.setUp(function() {
    casper.start(host + 'science/grrlscientist/2012/aug/07/3?view=mobile');
    casper.options.waitTimeout = 10000;
});

/**
 *   Scenario: Read top level comments
 *     Given I am on an article with comments
 *     Then I can see the comments
 * 
 **/
// Check the correct login/out buttons are present
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

    /* ===================== Top Comments ===================== */

    casper.test.begin('Loads top comments module', function (test) {

        casper.waitForSelector('.discussion__comments__top',
            function then() {
                test.assertExists('.discussion__comments__top');
                test.assertVisible('.discussion__comments__top');
                test.done();
            },
            function timeout() {
                test.fail('Top comments module failed to load');
            }
        );

    });

    casper.test.begin("Loads in >=1 comment <li>'s", function (test) {

        casper.waitForSelector('.discussion__comments__top li.d-comment--top-level',
            function then() {
                test.assertExists('.discussion__comments__top li.d-comment--top-level');
                test.assertVisible('.discussion__comments__top li.d-comment--top-level');
                test.done();
            },
            function timeout() {
                test.fail("No top comment <li>'s loaded");
            }
        );

    });

    casper.test.begin("Test top comments expand functionality", function (test) {

        casper.waitForSelector('.discussion__comments--top-comments',
            function then() {

                var startHeight = casper.getElementInfo('.discussion__comments__top').height,
                    fadeOut = '.d-image-fade',
                    showMore = '.js-show-more-top-comments';

                if (casper.getElementInfo('.discussion__comments__top').height === 600) {
                    // Check that excess top comments hidden and clicking show more button reveals them
                    test.assertTruthy(startHeight === 600, 'Reached max-height');
                    
                    test.assertExists(fadeOut, 'Fadeout exists');
                    test.assertVisible(fadeOut, 'Fadeout is visible');
                    
                    test.assertExists(showMore, 'Show more button exists');
                    test.assertVisible(showMore, 'Show more button is visible');
                    
                    casper.log("Clicking Top Comments 'show more' button", 'info');
                    casper.click(showMore);
                    
                    test.assertTruthy(
                        casper.getElementInfo('.discussion__comments__top').height > 600, 'Showed rest of top comments after show more clicked'
                    );
                    
                    test.done();
                } else {
                    // Check that comments don't reach max height and show more button doesnt exist
                    test.assertTruthy(startHeight < 600);
                    test.assertDoesntExist(fadeOut);
                    test.assertDoesntExist(showMore);
                    test.done();
                }
            },
            function timeout() {
                test.fail("Top comments expand functionality broken");
            }
        );

    });

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'discussion.xml');
});
