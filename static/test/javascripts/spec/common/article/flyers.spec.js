define([
    'helpers/injector',
    'helpers/fixtures',

    'common/utils/$',
    'common/utils/template',

    'text!common/views/content/richLinkTag.html'
], function(
    Injector,
    fixtures,

    $,
    template,

    richLinkTagTmpl
) {

    return new Injector()
        .store(['common/utils/config', 'common/modules/article/spacefinder'])
        .require(['common/modules/article/flyers', 'mocks'], function (flyers, mocks) {
            var config = mocks.store['common/utils/config'];
            var spacefinder = mocks.store['common/modules/article/spacefinder'];
            var getRichLinkElements = function () { return $('#article-body .element-rich-link'); };

            spacefinder.getParaWithSpace = function () {
                return $('#article-body p').first();
            };

            describe('Flyers', function () {
                var articleBodyConf = {
                        id: 'article-body',
                        fixtures: [
                            // Minimal article body fixture
                            '<div class="js-article__body"><p>foo</p></div>'
                        ]
                };

                var articleBodyFixtureElement;
                beforeEach(function() {
                    articleBodyFixtureElement = fixtures.render(articleBodyConf);
                });

                afterEach(function() {
                    fixtures.clean(articleBodyConf.id);
                });

                describe('#insertTagFlyer', function () {
                    describe('given no tag rich link', function () {
                        it('should not insert a tag rich link', function () {
                            flyers.insertTagFlyer();

                            var richLinkElements = getRichLinkElements();
                            expect(richLinkElements.length).toBe(0);
                        });
                    });

                    describe('given a tag rich link', function () {
                        // Mock a tag rich link
                        beforeEach(function () {
                            config.page = {
                                richLink: 'foo',
                                // Content API defaults
                                shouldHideAdverts: false,
                                showRelatedContent: true
                            };
                        });

                        afterEach(function () {
                            delete config.page.richLink;
                        });

                        it('should insert the provided tag rich link', function () {
                            flyers.insertTagFlyer();

                            var richLinkElements = getRichLinkElements();
                            expect(richLinkElements.length).toBe(1);
                            expect(richLinkElements[0].outerHTML)
                                .toBe(template(richLinkTagTmpl, { href: config.page.richLink }).trim());
                        });

                        describe('given `config.page.shouldHideAdverts` is set to `true`', function () {
                            beforeEach(function () {
                                config.page.shouldHideAdverts = true;
                            });

                            afterEach(function () {
                                delete config.page.shouldHideAdverts;
                            });

                            it('should not insert the provided tag rich link', function () {
                                flyers.insertTagFlyer();

                                var richLinkElements = getRichLinkElements();
                                expect(richLinkElements.length).toBe(0);
                            });
                        });

                        describe('given `config.page.showRelatedContent` is set to `false`', function () {
                            beforeEach(function () {
                                config.page.showRelatedContent = false;
                            });

                            afterEach(function () {
                                delete config.page.showRelatedContent;
                            });

                            it('should not insert the provided tag rich link', function () {
                                flyers.insertTagFlyer();

                                var richLinkElements = getRichLinkElements();
                                expect(richLinkElements.length).toBe(0);
                            });
                        });

                        describe('given an existing rich link with the same URL', function () {
                            // No need to clean because the parent element is reset after each
                            beforeEach(function() {
                                var existingRichLinkElement = $.create(template(richLinkTagTmpl, { href: config.page.richLink }));

                                articleBodyFixtureElement.append(existingRichLinkElement);
                            });

                            it('should not insert the provided tag rich link', function () {
                                flyers.insertTagFlyer();

                                var richLinkElements = getRichLinkElements();
                                expect(richLinkElements.length).toBe(1);
                            });
                        });
                    });
                });
            });
        });
});
