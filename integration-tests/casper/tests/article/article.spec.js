/* global document */
'use strict';

/**
 *
 * Article feature tests
 *
 **/

casper.test.setUp(function() {
    casper.start(host + "business/2010/feb/08/fsa-european-directive-hedge-funds?view=mobile");
    casper.options.waitTimeout = 10000;
});

casper.test.begin("Related content", function(test) {
    casper.then(function testArticleRelatedContent() {
        casper.waitUntilVisible('.js-related.lazyloaded', function() {
            test.assertVisible('.js-related', 'Related content trailblock visible');
            test.assertExists('.js-related .related-trails.shut', 'Additional related trails hidden on page load');
            casper.click('.js-related button');
            test.assertDoesntExist('.js-related .related-trails.shut', 'Button shows more related trails');
            test.done();
        }, function timeout(){
            casper.capture(screens + 'article-related-fail.png');
            test.fail("Failed to find toggling buttons");
        });
    });
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "article.xml");
});
