/* global document */
'use strict';

/**
 *
 * Article feature tests
 *
 **/

casper.start(host + "business/2010/feb/08/fsa-european-directive-hedge-funds?view=mobile");

casper.options.waitTimeout = 10000;

casper.waitUntilVisible('.js-related.lazyloaded', function() {
	casper.test.begin("Related content", function(test) {
		test.assertVisible('.js-related', 'Related content trailblock visible');
		test.assertExists('.js-related .related-trails.shut', 'Additional related trails hidden on page load');
		casper.click('.js-related button');
		test.assertDoesntExist('.js-related .related-trails.shut', 'Button shows more related trails');
		test.done();
	});
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "article.xml");
});
