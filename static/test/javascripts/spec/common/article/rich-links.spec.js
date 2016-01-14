define([
    'Promise',
    'helpers/injector',
    'helpers/fixtures',

    'common/utils/$',
    'common/utils/template',

    'text!common/views/content/richLinkTag.html'
], function (
    Promise,
    Injector,
    fixtures,

    $,
    template,

    richLinkTagTmpl
) {
    describe('richLinks', function () {
        var articleBodyConf = {
            id: 'article-body',
            fixtures: [
                // Minimal article body fixture
                '<div class="js-article__body"><p>foo</p></div>'
            ]
        };

        var getRichLinkElements = function () {
            return $('#article-body .element-rich-link');
        };

        var articleBodyFixtureElement,
            richLinks, config, spaceFiller,
            injector = new Injector();

        beforeEach(function (done) {
            articleBodyFixtureElement = fixtures.render(articleBodyConf);

            injector.require(['common/modules/article/rich-links', 'common/utils/config', 'common/modules/article/space-filler'], function () {
                richLinks = arguments[0];
                config = arguments[1];
                spaceFiller = arguments[2];

                spaceFiller.insertAtFirstSpace = function (rules, writer) {
                    var space = $('#article-body p').first();
                    writer(space);
                    return Promise.resolve(true);
                };

                done();
            });
        });

        afterEach(function () {
            fixtures.clean(articleBodyConf.id);
        });

        describe('#insertTagRichLink', function () {
            describe('given no tag rich link', function () {
                it('should not insert a tag rich link', function (done) {
                    richLinks.insertTagRichLink().then(function () {
                        var richLinkElements = getRichLinkElements();
                        expect(richLinkElements.length).toBe(0);
                        done();
                    });
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

                it('should insert the provided tag rich link', function (done) {
                    richLinks.insertTagRichLink().then(function () {
                        var richLinkElements = getRichLinkElements();
                        expect(richLinkElements.length).toBe(1);
                        expect(richLinkElements[0].outerHTML)
                            .toBe(template(richLinkTagTmpl, { href: config.page.richLink }).trim());

                        done();
                    });
                });

                describe('given `config.page.shouldHideAdverts` is set to `true`', function () {
                    beforeEach(function () {
                        config.page.shouldHideAdverts = true;
                    });

                    afterEach(function () {
                        delete config.page.shouldHideAdverts;
                    });

                    it('should not insert the provided tag rich link', function () {
                        richLinks.insertTagRichLink();

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
                        richLinks.insertTagRichLink();

                        var richLinkElements = getRichLinkElements();
                        expect(richLinkElements.length).toBe(0);
                    });
                });

                describe('given an existing rich link with the same URL', function () {
                    // No need to clean because the parent element is reset after each
                    beforeEach(function () {
                        var existingRichLinkElement = $.create(template(richLinkTagTmpl, { href: config.page.richLink }));

                        articleBodyFixtureElement.append(existingRichLinkElement);
                    });

                    it('should not insert the provided tag rich link', function () {
                        richLinks.insertTagRichLink();

                        var richLinkElements = getRichLinkElements();
                        expect(richLinkElements.length).toBe(1);
                    });
                });
            });
        });
    });
});
