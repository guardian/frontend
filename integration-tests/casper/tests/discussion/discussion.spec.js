/* global document */
'use strict';

/**
 * Discussion feature tests
 */

casper.test.setUp(function() {
    casper.start(host +'science/grrlscientist/2012/aug/07/3?view=mobile');
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

/* URL wont load for some reason... */

// casper.test.begin('Hash comment permalink links to relevant comment', function (test) {
    
//     casper.thenOpen(host +'football/2013/sep/25/manchester-united-liverpool-capital-one-cup#comment-27350599', function() {
        
//         casper.log(host +'football/2013/sep/25/manchester-united-liverpool-capital-one-cup#comment-27350599', 'error');

//         casper.waitForSelector('#comment-27350599', function () {
//             test.assertExists('#comment-27350599', 'Permalinked comment should exist');
//             test.assertVisible('#comment-27350599', 'Permalinked comment should be visible');
//             test.assertEval(function () {
//                 return window.getComputedStyle(
//                     document.querySelector('#comment-27350599'),':target').getPropertyValue('background-color') === 'rgb(244, 244, 238)';
//             }, "Permalinked comment should be highlighted using :target");
//             test.assertVisible('.d-discussion__show-more--newer');
//             test.assertVisible('.d-discussion__show-more--older');
//             test.done();
//         }, function timeout() {
//             casper.capture(screens + 'discussion-permalink-fail.png');
//             test.fail('Permalink failed to load comment');
//         }, 60000);

//     });

// });

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'discussion.xml');
});