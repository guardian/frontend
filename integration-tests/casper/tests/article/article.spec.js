/* global document */
'use strict';

/**
 *
 * Article feature tests
 *
 **/

casper.start(host + "business/2010/feb/08/fsa-european-directive-hedge-funds?view=mobile");

casper.then(function() {

	casper.test.begin("Article head", function(test) {
		test.assertVisible('a[data-link-name="article section"]', 'Section link visible');
		test.assertVisible('.article__head h1.article__headline', 'Headline visible');
		test.assertVisible('.article__head p.article__standfirst', 'Standfirst visible');
		test.assertVisible('.article__head p.article__dateline time', 'Publish date visible');
		test.assertVisible('.article__head p.article__dateline a.commentcount', 'Comment count visible');
		test.done();
	});

	casper.test.begin("Article main content", function(test) {
		test.assertVisible('img.main-image', 'Article main image visible');
		test.assertVisible('figcaption.main-caption', 'Main image caption visible');
		test.assertVisible('.article__meta-container p.byline', 'Byline visible');
		test.assertVisible('.js-article__container .article-body', 'Article body visible');
		test.assertVisible('.article__keywords ul.inline-list', 'Keyword list visible');
		test.done();
	});

	casper.test.begin("Article share links", function(test) {
		test.assertVisible('.article-v2__main-column a.social__action--email', 'Email share link visible');
		test.assertVisible('.article-v2__main-column a.social__action--facebook', 'Facebook share link visible');
		test.assertVisible('.article-v2__main-column a.social__action--twitter', 'Twitter share link visible');
		test.assertVisible('.article-v2__main-column a.social__action--gplus', 'Google+ share link visible');
		test.done();
	});

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