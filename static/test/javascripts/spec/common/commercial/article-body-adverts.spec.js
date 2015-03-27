define([
    'fastdom',
    'qwery',
    'Promise',
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    fastdom,
    qwery,
    Promise,
    $,
    fixtures,
    Injector
) {
    return new Injector()
        .store([
            'common/utils/config',
            'common/utils/detect',
            'common/modules/article/spacefinder'
        ])
        .require(['common/modules/commercial/article-body-adverts', 'mocks'], function (articleBodyAdverts, mocks) {
            describe('Article Body Adverts', function () {
                var getParaWithSpaceStub, $fixturesContainer, $style,
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

                    mocks.store['common/utils/config'].page = {
                        contentType: 'Article',
                        isLiveBlog: false,
                        hasInlineMerchandise: false
                    };
                    mocks.store['common/utils/config'].switches = {
                        standardAdverts: true
                    };
                    mocks.store['common/utils/detect'].getBreakpoint = function () {
                        return 'desktop';
                    };

                    getParaWithSpaceStub = sinon.stub();
                    var paras = qwery('p', $fixturesContainer);
                    getParaWithSpaceStub.onFirstCall().returns(Promise.resolve(paras[0]));
                    getParaWithSpaceStub.onSecondCall().returns(Promise.resolve(paras[1]));
                    mocks.store['common/modules/article/spacefinder'].getParaWithSpace = getParaWithSpaceStub;
                });

                afterEach(function () {
                    fixtures.clean(fixturesConfig.id);
                    $style.remove();
                    articleBodyAdverts.reset();
                });

                it('should exist', function () {
                    expect(articleBodyAdverts).toBeDefined();
                });

                it('should call "getParaWithSpace" with correct arguments', function (done) {
                    mocks.store['common/utils/detect'].isBreakpoint = function () {
                        return false;
                    };

                    articleBodyAdverts.init().then(function () {
                        expect(getParaWithSpaceStub).toHaveBeenCalledWith({
                            minAbove: 700,
                            minBelow: 300,
                            selectors: {
                                ' > h2': {minAbove: 0, minBelow: 250},
                                ' > *:not(p):not(h2)': {minAbove: 35, minBelow: 400},
                                ' .ad-slot': {minAbove: 500, minBelow: 500}
                            }
                        });
                        done();
                    });
                });

                it('should not not display ad slot if standard-adverts switch is off', function () {
                    mocks.store['common/utils/config'].switches.standardAdverts = false;
                    expect(articleBodyAdverts.init()).toBe(false);
                });

                it('should not display ad slot if not on an article', function () {
                    mocks.store['common/utils/config'].page.contentType = 'Gallery';
                    expect(articleBodyAdverts.init()).toBe(false);
                });

                it('should not display ad slot if a live blog', function () {
                    mocks.store['common/utils/config'].page.contentType = 'LiveBlog';
                    expect(articleBodyAdverts.init()).toBe(false);
                });

                it('should insert an inline ad container to the available slot', function (done) {
                    articleBodyAdverts.init().then(function () {
                        expect(getParaWithSpaceStub).toHaveBeenCalledOnce();
                        expect(qwery('#dfp-ad--inline1', $fixturesContainer).length).toBe(1);
                        done();
                    });
                });

                it('should insert an inline merchandising slot if page has one', function (done) {
                    mocks.store['common/utils/config'].page.hasInlineMerchandise = true;
                    articleBodyAdverts.init().then(function () {
                        expect(qwery('#dfp-ad--im', $fixturesContainer).length).toBe(1);
                        expect(qwery('#dfp-ad--inline1', $fixturesContainer).length).toBe(1);
                        done();
                    });
                });
            });
        });
});
