import qwery from 'qwery';
import sinon from 'sinonjs';
import Promise from 'Promise';
import $ from 'common/utils/$';
import fixtures from 'helpers/fixtures';
import Injector from 'helpers/injector';

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
        articleBodyAdverts, config, detect, spacefinder, userAdPreference;

    beforeEach(function (done) {

        injector.test([
            'common/modules/commercial/article-body-adverts',
            'common/utils/config',
            'common/utils/detect',
            'common/modules/article/spacefinder',
            'common/modules/commercial/user-ad-preference'
        ], function () {
            articleBodyAdverts = arguments[0];
            config = arguments[1];
            detect = arguments[2];
            spacefinder = arguments[3];
            userAdPreference = arguments[4];

            $fixturesContainer = fixtures.render(fixturesConfig);
            $style = $.create('<style type="text/css"></style>')
                .html('body:after{ content: "desktop"}')
                .appendTo('head');

            config.page = {
                contentType: 'Article',
                isLiveBlog: false,
                hasInlineMerchandise: false
            };
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

            userAdPreference.hideAds = false;

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

    it('should call "getParaWithSpace" max 10 times', function (done) {
        config.switches.viewability = true;

        articleBodyAdverts.init()
            .then(function () {
                expect(getParaWithSpaceStub.callCount).toEqual(10);
                done();
            });
    });

    it('should not not display ad slot if standard-adverts switch is off', function () {
        config.switches.standardAdverts = false;
        expect(articleBodyAdverts.init()).toBe(false);
    });

    it('should not display ad slot if not on an article', function () {
        config.page.contentType = 'Gallery';
        expect(articleBodyAdverts.init()).toBe(false);
    });

    it('should not display ad slot if a live blog', function () {
        config.page.contentType = 'LiveBlog';
        expect(articleBodyAdverts.init()).toBe(false);
    });

    it('should not display ad slot if user has opted out of adverts', function () {
        userAdPreference.hideAds = true;
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
