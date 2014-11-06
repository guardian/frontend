define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'jasq'
], function (
    qwery,
    $,
    fixtures
) {

    var getParaWithSpaceStub, $fixturesContainer;

    describe('Article Body Adverts', {
        moduleName: 'common/modules/commercial/article-body-adverts',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            standardAdverts: true
                        },
                        page: {
                            contentType: 'Article',
                            isLiveBlog: false,
                            hasInlineMerchandise: false
                        }
                    };
                },
                'common/modules/article/spacefinder': function () {
                    getParaWithSpaceStub = sinon.stub();
                    var paras = qwery('p', $fixturesContainer);
                    getParaWithSpaceStub.onFirstCall().returns(paras[0]);
                    getParaWithSpaceStub.onSecondCall().returns(paras[1]);
                    return {
                        getParaWithSpace: getParaWithSpaceStub
                    };
                }
            }
        },
        specify: function () {

            var $style,
                fixturesConfig = {
                    id: 'article-body-adverts',
                    fixtures: [
                        '<p class="first-para"></p>',
                        '<p class="second-para"></p>',
                        '<p class="third-para"></p>'
                    ]
                };

            beforeEach(function () {
                $fixturesContainer = fixtures.render(fixturesConfig);
                $style = $.create('<style type="text/css"></style>')
                    .html('body:after{ content: "desktop"}')
                    .appendTo('head');
            });

            afterEach(function () {
                fixtures.clean(fixturesConfig.id);
                $style.remove();
            });

            it('should exist', function (articleBodyAdverts) {
                expect(articleBodyAdverts).toBeDefined();
            });

            it('should call "getParaWithSpace" with correct arguments', function (articleBodyAdverts) {
                articleBodyAdverts.init();
                expect(getParaWithSpaceStub).toHaveBeenCalledWith({
                    minAbove: 700,
                    minBelow: 300,
                    selectors: {
                        ' > h2': {minAbove: 0, minBelow: 250},
                        ' > *:not(p):not(h2)': {minAbove: 35, minBelow: 400},
                        ' .ad-slot': {minAbove: 500, minBelow: 500}
                    }
                })
            });

            it('should not not display ad slot if standard-adverts switch is off', function (articleBodyAdverts, deps) {
                deps['common/utils/config'].switches.standardAdverts = false;
                expect(articleBodyAdverts.init()).toBe(false);
            });

            it('should not display ad slot if not on an article', function (articleBodyAdverts, deps) {
                deps['common/utils/config'].page.contentType = 'Gallery';
                expect(articleBodyAdverts.init()).toBe(false);
            });

            it('should not display ad slot if a live blog', function (articleBodyAdverts, deps) {
                deps['common/utils/config'].page.contentType = 'LiveBlog';
                expect(articleBodyAdverts.init()).toBe(false);
            });

            it('should insert an inline ad container to the available slot', function (articleBodyAdverts) {
                articleBodyAdverts.init();
                expect(qwery('#dfp-ad--inline1', $fixturesContainer).length).toBe(1);
                expect(getParaWithSpaceStub).toHaveBeenCalledOnce();
            });

            it('should insert two inline ad slots if less than desktop', function (articleBodyAdverts) {
                $style.html('body:after{ content: "mobile"}');
                articleBodyAdverts.init();
                expect(qwery('#dfp-ad--inline1', $fixturesContainer).length).toBe(1);
                expect(qwery('#dfp-ad--inline2', $fixturesContainer).length).toBe(1);
            });

            it('should insert an inline merchandising slot if page has one', function (articleBodyAdverts, deps) {
                deps['common/utils/config'].page.hasInlineMerchandise = true;
                articleBodyAdverts.init();
                expect(qwery('#dfp-ad--im', $fixturesContainer).length).toBe(1);
                expect(qwery('#dfp-ad--inline1', $fixturesContainer).length).toBe(1);
            });

        }
    });

});
