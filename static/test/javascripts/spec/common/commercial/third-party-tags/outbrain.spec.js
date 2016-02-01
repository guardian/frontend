define('ophan/ng', [], function () { return { record: function () {} }; });
define('js', [], function () { return function () {}; });
define('js!//widgets.outbrain.com/outbrain.js', [], function () { return function () {}; });
define([
    'fastdom',
    'helpers/injector',
    'helpers/fixtures',
    'common/utils/$'
], function (
    fastdom,
    Injector,
    fixtures,
    $
) {
    var fixturesConfig = {
            id: 'outbrain',
            fixtures: [
                '<div id="dfp-ad--merchandising-high"></div>',
                '<div id="dfp-ad--merchandising"></div>',
                '<div class="js-outbrain"><div class="js-outbrain-container"></div></div>'
            ]
        },
        $fixtureContainer,
        config,
        mediator,
        identity,
        detect,
        sut, // System under test
        getSection,
        commercialFeatures,
        injector = new Injector();

    describe('Outbrain', function () {
        beforeEach(function (done) {
            // injector.mock('ophan/ng', { record: function () {} });
            injector.require([
                'common/modules/commercial/third-party-tags/outbrain',
                'common/modules/commercial/third-party-tags/outbrain-sections',
                'common/utils/mediator',
                'common/utils/config',
                'common/modules/identity/api',
                'common/utils/detect',
                'common/modules/commercial/commercial-features'
            ], function () {
                sut      = arguments[0];
                getSection = arguments[1];
                mediator = arguments[2];
                config   = arguments[3];
                identity = arguments[4];
                detect   = arguments[5];
                commercialFeatures = arguments[6];

                config.switches.outbrain = true;
                config.page = {
                    section: 'uk-news',
                    isPreview: false,
                    isFront: false,
                    commentable: true,
                    edition: 'UK'
                };

                identity.isUserLoggedIn = function () {
                    return false;
                };
                detect.adblockInUse = function () { return false; };

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
            var eventStub, eventStubLo;

            beforeEach(function () {
                eventStub = {
                    slot: {
                        getSlotElementId: function () {
                            return 'dfp-ad--merchandising-high';
                        }
                    },
                    isEmpty: true
                };
                eventStubLo = {
                    slot: {
                        getSlotElementId: function () {
                            return 'dfp-ad--merchandising';
                        }
                    },
                    isEmpty: true
                };

                spyOn(sut, 'load');
            });

            it('should start outbrain component', function (done) {
                sut.init().then(function () {
                    expect(sut.load).toHaveBeenCalled();
                    done();
                });
                mediator.emit('modules:commercial:dfp:rendered', eventStub);
                mediator.emit('modules:commercial:dfp:rendered', eventStubLo);
            });

            it('should not load when sensitive content', function (done) {
                commercialFeatures.outbrain = false;
                sut.init().then(function () {
                    expect(sut.load).not.toHaveBeenCalled();
                    done();
                });
            });

            it('should not load when isPreview', function (done) {
                config.page.isPreview = true;

                sut.init().then(function () {
                    expect(sut.load).not.toHaveBeenCalled();
                    done();
                });
            });

            it('should not load when on network front', function (done) {
                config.page.isFront = true;

                sut.init().then(function () {
                    expect(sut.load).not.toHaveBeenCalled();
                    done();
                });
            });

            it('should not load when user is logged in', function (done) {
                identity.isUserLoggedIn = function () {
                    return true;
                };

                sut.init().then(function () {
                    expect(sut.load).not.toHaveBeenCalled();
                    done();
                });
            });

            it('should load when user is logged in but there are no comments on the page', function (done) {
                identity.isUserLoggedIn = function () {
                    return true;
                };

                config.page.commentable = false;

                sut.init().then(function () {
                    expect(sut.load).toHaveBeenCalled();
                    done();
                });
                mediator.emit('modules:commercial:dfp:rendered', eventStub);
                mediator.emit('modules:commercial:dfp:rendered', eventStubLo);
            });

            it('should load instantly when ad block is in use', function (done) {
                detect.adblockInUse = function () { return true; };

                sut.init().then(function () {
                    expect(sut.load).toHaveBeenCalled();
                    done();
                });
            });

            it('should load in the low-priority merch component', function (done) {
                eventStub.isEmpty = false;
                eventStubLo.isEmpty = true;
                config.switches.outbrainReplacesMerch = true;

                var oldEmit = mediator.emit;
                mediator.emit = function (eventName, data) {
                    return new Promise(function (resolve) {
                        oldEmit.call(mediator, eventName, data);
                        resolve();
                    });
                };

                sut.init().then(function () {
                    expect(sut.load).toHaveBeenCalledWith('merchandising');
                    done();
                });
                mediator.emit('modules:commercial:dfp:rendered', eventStub).then(function () {
                    mediator.emit('modules:commercial:dfp:rendered', eventStubLo);
                });

                mediator.emit = oldEmit;
            });

            it('should not load if both merch components are loaded', function (done) {
                eventStub.isEmpty = false;
                eventStubLo.isEmpty = false;
                config.switches.outbrainReplacesMerch = true;

                var oldEmit = mediator.emit;
                mediator.emit = function (eventName, data) {
                    return new Promise(function (resolve) {
                        oldEmit.call(mediator, eventName, data);
                        resolve();
                    });
                };

                sut.init().then(function () {
                    expect(sut.load).not.toHaveBeenCalledWith('merchandising');
                    done();
                });
                mediator.emit('modules:commercial:dfp:rendered', eventStub).then(function () {
                    mediator.emit('modules:commercial:dfp:rendered', eventStubLo);
                });

                mediator.emit = oldEmit;
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
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('CR_14');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('CR_14');
                    done();
                });
            });

            it('should create two containers for tablet with correct IDs for slot merch', function (done) {
                detect.getBreakpoint = function () {
                    return 'tablet';
                };

                sut.load('merchandising').then(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_11');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('MB_11');
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
                    var url = requireStub.args[1][0][0];
                    expect(url).toBe('js!//widgets.outbrain.com/outbrain.js');
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
