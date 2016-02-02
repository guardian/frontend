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
                '<div class="js-outbrain"><div class="js-outbrain-container"></div></div>'
            ]
        },
        $fixtureContainer,
        config,
        mediator,
        identity,
        detect,
        sut, // System under test
        injector = new Injector();

    describe('Outbrain', function () {
        beforeEach(function (done) {
            // injector.mock('ophan/ng', { record: function () {} });
            injector.require([
                'common/modules/commercial/third-party-tags/outbrain',
                'common/utils/mediator',
                'common/utils/config',
                'common/modules/identity/api',
                'common/utils/detect'], function () {
                sut      = arguments[0];
                mediator = arguments[1];
                config   = arguments[2];
                identity = arguments[3];
                detect   = arguments[4];

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

                $fixtureContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
            mediator.removeEvent('modules:commercial:dfp:rendered');
        });

        it('should exist', function () {
            expect(sut).toBeDefined();
        });

        describe('Init', function () {
            var eventStub;

            beforeEach(function () {
                eventStub = {
                    slot: {
                        getSlotId: function () {
                            return {
                                getDomId: function () {
                                    return 'dfp-ad--merchandising-high';
                                }
                            };
                        }
                    },
                    isEmpty: true
                };
            });

            it('should start outbrain component', function () {
                spyOn(sut, 'load');

                sut.init();
                mediator.emit('modules:commercial:dfp:rendered', eventStub);
                expect(sut.load).toHaveBeenCalled();
            });

            it('should not load when children books site', function () {
                config.page.section = 'childrens-books-site';
                spyOn(sut, 'load');

                sut.init();
                mediator.emit('modules:commercial:dfp:rendered', eventStub);
                expect(sut.load).not.toHaveBeenCalled();
            });

            it('should not load when user is logged in', function () {
                identity.isUserLoggedIn = function () {
                    return true;
                };
                spyOn(sut, 'load');

                sut.init();
                mediator.emit('modules:commercial:dfp:rendered', eventStub);
                expect(sut.load).not.toHaveBeenCalled();
            });

            it('should not load when isPreview', function () {
                config.page.isPreview = true;
                spyOn(sut, 'load');

                sut.init();
                mediator.emit('modules:commercial:dfp:rendered', eventStub);
                expect(sut.load).not.toHaveBeenCalled();
            });

            it('should not load when merchandising-high component is not empty', function () {
                spyOn(sut, 'load');

                eventStub.isEmpty = false;

                sut.init();
                mediator.emit('modules:commercial:dfp:rendered', eventStub);

                expect(sut.load).not.toHaveBeenCalled();
            });

            it('should not load when on network front', function () {
                spyOn(sut, 'load');

                config.page.isFront = true;

                sut.init();
                mediator.emit('modules:commercial:dfp:rendered', eventStub);
                expect(sut.load).not.toHaveBeenCalled();
            });

            it('should load when user is logged in but there are no comments on the page', function () {
                identity.isUserLoggedIn = function () {
                    return true;
                };

                config.page.commentable = false;
                spyOn(sut, 'load');

                sut.init();
                mediator.emit('modules:commercial:dfp:rendered', eventStub);
                expect(sut.load).toHaveBeenCalled();
            });

            /*
                Loading Outbrain is dependent on succefull return of high relevance component
                from DFP. AdBlock is blocking DFP calls so we are not getting any response and thus
                not loading Outbrain. As Outbrain is being partially loaded behind the adblock we can
                make the call instantly when we detect adBlock in use.
             */
            it('should load instantly when ad block is in use', function () {
                spyOn(sut, 'load');

                detect.adblockInUse = function () { return true; };

                sut.init();
                expect(sut.load).toHaveBeenCalled();
            });

            it('should load instantly when international edition', function () {
                spyOn(sut, 'load');

                config.page.edition = 'INT';

                sut.init();
                expect(sut.load).toHaveBeenCalled();
            });
        });

        describe('Sections', function () {
            it('should return "sections" for news sections', function () {
                config.page.section = 'uk-news';
                expect(sut.getSection()).toEqual('sections');

                config.page.section = 'us-news';
                expect(sut.getSection()).toEqual('sections');

                config.page.section = 'au-news';
                expect(sut.getSection()).toEqual('sections');
            });

            it('should return "sections" for selected sections', function () {
                config.page.section = 'politics';
                expect(sut.getSection()).toEqual('sections');

                config.page.section = 'world';
                expect(sut.getSection()).toEqual('sections');

                config.page.section = 'business';
                expect(sut.getSection()).toEqual('sections');

                config.page.section = 'commentisfree';
                expect(sut.getSection()).toEqual('sections');
            });

            it('should return "all" for all other sections', function () {
                config.page.section = 'culture';
                expect(sut.getSection()).toEqual('all');

                config.page.section = 'football';
                expect(sut.getSection()).toEqual('all');
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

            it('should create two containers for desktop with correct IDs for "sections"', function (done) {
                detect.getBreakpoint = function () {
                    return 'desktop';
                };
                sut.getSection = function () {
                    return 'sections';
                };

                sut.load();

                fastdom.defer(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('AR_12');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('AR_14');
                    done();
                });
            });

            it('should create two containers for desktop with correct IDs for "all"', function (done) {
                detect.getBreakpoint = function () {
                    return 'desktop';
                };
                sut.getSection = function () {
                    return 'all';
                };

                sut.load();

                fastdom.defer(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('AR_13');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('AR_15');
                    done();
                });
            });

            it('should detect wide breakpoint as desktop', function (done) {
                detect.getBreakpoint = function () {
                    return 'wide';
                };
                sut.getSection = function () {
                    return 'all';
                };

                sut.load();

                fastdom.defer(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('AR_13');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('AR_15');
                    done();
                });
            });

            it('should create two containers for tablet with correct IDs for "sections"', function (done) {
                detect.getBreakpoint = function () {
                    return 'tablet';
                };
                sut.getSection = function () {
                    return 'sections';
                };

                sut.load();

                fastdom.defer(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_6');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('MB_8');
                    done();
                });
            });

            it('should create two containers for tablet with correct IDs for "all"', function (done) {
                detect.getBreakpoint = function () {
                    return 'tablet';
                };
                sut.getSection = function () {
                    return 'all';
                };

                sut.load();

                fastdom.defer(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_7');
                    expect($('.OUTBRAIN', $fixtureContainer).last().data('widgetId')).toEqual('MB_9');
                    done();
                });
            });

            it('should create only one container for mobile with correct IDs for "sections"', function (done) {
                detect.getBreakpoint = function () {
                    return 'mobile';
                };
                sut.getSection = function () {
                    return 'sections';
                };

                sut.load();

                fastdom.defer(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_4');
                    done();
                });
            });

            it('should create only one container for mobile with correct IDs for "all"', function (done) {
                detect.getBreakpoint = function () {
                    return 'mobile';
                };
                sut.getSection = function () {
                    return 'all';
                };

                sut.load();

                fastdom.defer(function () {
                    expect($('.OUTBRAIN', $fixtureContainer).first().data('widgetId')).toEqual('MB_5');
                    done();
                });
            });

            it('should require outbrain javascript', function (done) {
                sut.load();

                fastdom.defer(function () {
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
                sut.getSection = function () {
                    return 'all';
                };

                spyOn(sut, 'tracking');

                sut.load();

                fastdom.defer(function () {
                    expect(sut.tracking).toHaveBeenCalledWith('AR_13');
                    done();
                });
            });
        });
    });
});

