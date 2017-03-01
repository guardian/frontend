define('ophan/ng', [], function () { return { record: function () {} }; });
define([
    'fastdom',
    'helpers/injector',
    'helpers/fixtures',
    'common/utils/$',
    'Promise'
], function (
    fastdom,
    Injector,
    fixtures,
    $,
    Promise
) {
    var fixturesConfig = {
            id: 'outbrain',
            fixtures: [
                '<div id="dfp-ad--merchandising-high"></div>',
                '<div id="dfp-ad--merchandising"></div>',
                '<div class="js-outbrain"><div class="js-outbrain-container"></div></div>'
            ]
        },
        ads = {
           'dfp-ad--merchandising-high': true,
           'dfp-ad--merchandising': false
        },
        $fixtureContainer,
        config,
        detect,
        sut, // System under test
        getSection,
        commercialFeatures,
        injector = new Injector();

    describe('Outbrain', function () {
        var loadScript = jasmine.createSpy('loadScript');
        beforeEach(function (done) {
            injector.mock('commercial/modules/dfp/track-ad-render', function(id) {
                return Promise.resolve(ads[id]);
            });
            injector.mock('common/utils/load-script', loadScript);
            injector.require([
                'commercial/modules/third-party-tags/outbrain',
                'commercial/modules/third-party-tags/outbrain-sections',
                'common/utils/config',
                'common/utils/detect',
                'commercial/modules/commercial-features'
            ], function () {
                sut      = arguments[0];
                getSection = arguments[1];
                config   = arguments[2];
                detect   = arguments[3];
                commercialFeatures = arguments[4];

                config.switches.outbrain = true;
                config.switches.emailInArticleOutbrain = false;
                config.page = {
                    section: 'uk-news',
                    commentable: true
                };
                detect.adblockInUse = Promise.resolve(false);

                commercialFeatures.outbrain = true;

                $fixtureContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(sut).toBeDefined();
        });

        describe('Init', function () {
            beforeEach(function () {
                spyOn(sut, 'load');
            });

            it('should start outbrain component', function (done) {
                sut.init().then(function () {
                    expect(sut.load).toHaveBeenCalled();
                    done();
                });
            });

            it('should load instantly when ad block is in use', function (done) {
                detect.adblockInUse = Promise.resolve(false);

                sut.init().then(function () {
                    expect(sut.load).toHaveBeenCalled();
                    done();
                });
            });

            it('should load in the low-priority merch component', function (done) {
                ads['dfp-ad--merchandising-high'] = true;
                ads['dfp-ad--merchandising'] = false;

                sut.init().then(function () {
                    expect(sut.load).toHaveBeenCalledWith('merchandising');
                    done();
                });
            });

            it('should not load if both merch components are loaded', function (done) {
                ads['dfp-ad--merchandising-high'] = true;
                ads['dfp-ad--merchandising'] = true;

                sut.init().then(function () {
                    expect(sut.load).not.toHaveBeenCalledWith('merchandising');
                    done();
                });
            });
        });

        describe('Sections', function () {
            it('should return "news" for news sections', function () {
                expect(getSection('uk-news')).toEqual('news');
                expect(getSection('us-news')).toEqual('news');
                expect(getSection('au-news')).toEqual('news');
            });

            it('should return "news" for selected sections', function () {
                expect(getSection('politics')).toEqual('news');
                expect(getSection('world')).toEqual('news');
                expect(getSection('business')).toEqual('news');
                expect(getSection('commentisfree')).toEqual('news');
            });

            it('should return "defaults" for all other sections', function () {
                expect(getSection('culture')).toEqual('defaults');
                expect(getSection('football')).toEqual('defaults');
            });
        });

        describe('Load', function () {
            var requireStub;
            beforeEach(function () {
                requireStub = sinon.stub(window, 'require');
            });

            afterEach(function () {
                requireStub.restore();
            });

            it('should create two containers for desktop with correct IDs for slot 1', function (done) {
                detect.getBreakpoint = function () {
                    return 'desktop';
                };
                config.page.section = 'uk-news';

                sut.load().then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('AR_12');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('AR_14');
                    done();
                });
            });

            it('should create two containers for desktop with correct IDs for slot 2', function (done) {
                detect.getBreakpoint = function () {
                    return 'desktop';
                };
                config.page.section = 'football';

                sut.load().then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('AR_13');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('AR_15');
                    done();
                });
            });

            it('should detect wide breakpoint as desktop', function (done) {
                detect.getBreakpoint = function () {
                    return 'wide';
                };
                config.page.section = 'football';

                sut.load().then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('AR_13');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('AR_15');
                    done();
                });
            });

            it('should create two containers for tablet with correct IDs for slot 1', function (done) {
                detect.getBreakpoint = function () {
                    return 'tablet';
                };
                config.page.section = 'uk-news';

                sut.load().then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_6');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('MB_8');
                    done();
                });
            });

            it('should create two containers for tablet with correct IDs for slot 2', function (done) {
                detect.getBreakpoint = function () {
                    return 'tablet';
                };
                config.page.section = 'football';

                sut.load().then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_7');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('MB_9');
                    done();
                });
            });

            it('should create only one container for mobile with correct IDs for slot 1', function (done) {
                detect.getBreakpoint = function () {
                    return 'mobile';
                };
                config.page.section = 'uk-news';

                sut.load().then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_4');
                    done();
                });
            });

            it('should create only one container for mobile with correct IDs for slot 2', function (done) {
                detect.getBreakpoint = function () {
                    return 'mobile';
                };
                config.page.section = 'football';

                sut.load().then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_5');
                    done();
                });
            });

            it('should create two containers for destkop with correct IDs for slot merch', function (done) {
                detect.getBreakpoint = function () {
                    return 'desktop';
                };
                config.page.edition = 'AU';

                sut.load('merchandising').then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('AR_28');
                    done();
                });
            });

            it('should create two containers for tablet with correct IDs for slot merch', function (done) {
                detect.getBreakpoint = function () {
                    return 'tablet';
                };

                sut.load('merchandising').then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_11');
                    done();
                });
            });

            it('should create only one container for mobile with correct IDs for slot merch', function (done) {
                detect.getBreakpoint = function () {
                    return 'mobile';
                };

                sut.load('merchandising').then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_10');
                    done();
                });
            });

            it('should require outbrain javascript', function (done) {
                sut.load().then(function () {
                    expect(loadScript).toHaveBeenCalledWith('//widgets.outbrain.com/outbrain.js');
                    done();
                });
            });
        });

        describe('Tracking', function () {
            it('should call tracking method', function (done) {
                // We don't care about the require for this test, so stub it
                sinon.stub(window, 'require');

                detect.getBreakpoint = function () {
                    return 'wide';
                };
                config.page.section = 'football';

                spyOn(sut, 'tracking');

                sut.load().then(function () {
                    expect(sut.tracking).toHaveBeenCalledWith('AR_13');
                    done();
                });
            });
        });
    });
});
