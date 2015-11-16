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
    describe('Article Body Adverts', function () {
        var getParaWithSpaceStub, $fixturesContainer, $style,
            fixturesConfig = {
                id: 'article-body-adverts',
                fixtures: [
                    '<p class="first-para"></p>',
                    '<p class="second-para"></p>',
                    '<p class="third-para"></p>',
                    '<p class="para"></p>',
                    '<p class="para"></p>',
                    '<p class="para"></p>',
                    '<p class="para"></p>',
                    '<p class="para"></p>',
                    '<p class="para"></p>',
                    '<p class="para"></p>',
                    '<p class="para"></p>'
                ]
            },
            injector = new Injector(),
            articleBodyAdverts, config, detect, spacefinder, commercialFeatures;

        beforeEach(function (done) {

            injector.require([
                'common/modules/commercial/article-body-adverts',
                'common/utils/config',
                'common/utils/detect',
                'common/modules/article/spacefinder',
                'common/modules/commercial/commercial-features'
            ], function () {
                articleBodyAdverts = arguments[0];
                config = arguments[1];
                detect = arguments[2];
                spacefinder = arguments[3];
                commercialFeatures = arguments[4];

                $fixturesContainer = fixtures.render(fixturesConfig);
                $style = $.create('<style type="text/css"></style>')
                    .html('body:after{ content: "desktop"}')
                    .appendTo('head');

                config.switches = {
                    standardAdverts: true,
                    viewability: true
                };
                config.tests = {
                    mobileTopBannerRemove: false
                };
                detect.getBreakpoint = function () {
                    return 'desktop';
                };

                getParaWithSpaceStub = sinon.stub();
                var paras = qwery('p', $fixturesContainer);
                getParaWithSpaceStub.onCall(0).returns(Promise.resolve(paras[0]));
                getParaWithSpaceStub.onCall(1).returns(Promise.resolve(paras[1]));
                getParaWithSpaceStub.onCall(2).returns(Promise.resolve(paras[2]));
                getParaWithSpaceStub.onCall(3).returns(Promise.resolve(paras[3]));
                getParaWithSpaceStub.onCall(4).returns(Promise.resolve(paras[4]));
                getParaWithSpaceStub.onCall(5).returns(Promise.resolve(paras[5]));
                getParaWithSpaceStub.onCall(6).returns(Promise.resolve(paras[6]));
                getParaWithSpaceStub.onCall(7).returns(Promise.resolve(paras[7]));
                getParaWithSpaceStub.onCall(8).returns(Promise.resolve(paras[8]));
                getParaWithSpaceStub.onCall(9).returns(Promise.resolve(paras[9]));
                getParaWithSpaceStub.onCall(10).returns(Promise.resolve(paras[10]));
                getParaWithSpaceStub.onCall(11).returns(Promise.resolve(undefined));
                spacefinder.getParaWithSpace = getParaWithSpaceStub;

                commercialFeatures.articleBodyAdverts = true;

                done();
            });
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
            detect.isBreakpoint = function () {
                return false;
            };

            config.switches.viewability = false;

            articleBodyAdverts.init()
                .then(function () {
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

        it('should call "getParaWithSpace" with correct arguments multiple times - in test', function (done) {
            config.switches.viewability = true;

            articleBodyAdverts.init()
                .then(function () {
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
                })
                .then(function () {
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
                })
                .then(function () {
                    expect(getParaWithSpaceStub).toHaveBeenCalledWith({
                        minAbove: 700,
                        minBelow: 300,
                        selectors: {
                            ' > h2': {minAbove: 0, minBelow: 250},
                            ' > *:not(p):not(h2)': {minAbove: 35, minBelow: 400},
                            ' .ad-slot': {minAbove: 1300, minBelow: 1300}
                        }
                    });
                    done();
                });
        });

        it('should call "getParaWithSpace" max 2 times when not viewability and on max tablet', function (done) {
            config.switches.viewability = false;
            detect.isBreakpoint = function () { return true; };

            articleBodyAdverts.init()
                .then(function () {
                    expect(getParaWithSpaceStub.callCount).toEqual(2);
                    done();
                });
        });

        it('should call "getParaWithSpace" max 2 times when not viewability and on desktop', function (done) {
            config.switches.viewability = false;
            detect.isBreakpoint = function () { return false; };

            articleBodyAdverts.init()
                .then(function () {
                    expect(getParaWithSpaceStub.callCount).toEqual(1);
                    done();
                });
        });

        it('should call "getParaWithSpace" max 2 times when not on mobile', function (done) {
            config.switches.viewability = true;
            detect.getBreakpoint = function () { return 'mobile'; };
            detect.isBreakpoint = function () { return true; };

            articleBodyAdverts.init()
                .then(function () {
                    expect(getParaWithSpaceStub.callCount).toEqual(2);
                    done();
                });
        });

        it('should call "getParaWithSpace" max 9 times', function (done) {
            config.switches.viewability = true;

            articleBodyAdverts.init()
                .then(function () {
                    expect(getParaWithSpaceStub.callCount).toEqual(9);
                    done();
                });
        });

        it('should not not display ad slot if turned off in commercial features', function () {
            commercialFeatures.articleBodyAdverts = false;
            expect(articleBodyAdverts.init()).toBe(false);
        });

        it('should insert an inline ad container to the available slot', function (done) {
            articleBodyAdverts.init().then(function () {
                expect(getParaWithSpaceStub).toHaveBeenCalled();
                expect(qwery('#dfp-ad--inline1', $fixturesContainer).length).toBe(1);
                done();
            });
        });

        it('should insert an inline merchandising slot if page has one', function (done) {
            config.page.hasInlineMerchandise = true;
            articleBodyAdverts.init().then(function () {
                expect(qwery('#dfp-ad--im', $fixturesContainer).length).toBe(1);
                expect(qwery('#dfp-ad--inline1', $fixturesContainer).length).toBe(1);
                done();
            });
        });

    });
});
