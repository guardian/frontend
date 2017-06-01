define([
    'bonzo',
    'qwery',
    'lib/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    bonzo,
    qwery,
    $,
    fixtures,
    Injector
) {
    function noop() {

    }
    describe('DFP', function () {

        var $style,
            breakpoint = 'wide',
            fixturesConfig = {
                id: 'article',
                fixtures: [
                    '<div id="dfp-ad-html-slot" class="js-ad-slot" data-name="html-slot" data-mobile="300,50"></div>\
                    <div id="dfp-ad-script-slot" class="js-ad-slot" data-name="script-slot" data-mobile="300,50|320,50" data-refresh="false"></div>\
                    <div id="dfp-ad-already-labelled" class="js-ad-slot ad-label--showing" data-name="already-labelled" data-mobile="300,50|320,50"  data-tablet="728,90"></div>\
                    <div id="dfp-ad-dont-label" class="js-ad-slot" data-label="false" data-name="dont-label" data-mobile="300,50|320,50"  data-tablet="728,90" data-desktop="728,90|900,250|970,250"></div>'
                ]
            },
            makeFakeEvent = function (id, isEmpty) {
                return {
                    isEmpty: isEmpty,
                    slot: {
                        getSlotElementId: function () {
                            return id;
                        }
                    },
                    size: ['300', '250']
                };
            },
            injector = new Injector(),
            dfp, dfpEnv, config, detect, commercialFeatures;

        function reset() {
            dfpEnv.advertIds = {};
            dfpEnv.adverts = [];
            dfpEnv.advertsToRefresh = [];
        }

        beforeEach(function (done) {
            injector.mock({
                'common/modules/analytics/google': function noop() {
                    // No implementation
                },
                'commercial/modules/dfp/apply-creative-template': {
                    applyCreativeTemplate: function () {
                      return Promise.resolve(true);
                    }
                },
                'lib/load-script': {
                    loadScript: function () {
                        return Promise.resolve();
                    }
                },
                'lodash/functions/once': function once(func) {
                    return func;
                },
            });
            injector.require([
                'commercial/modules/dfp/prepare-googletag',
                'commercial/modules/dfp/get-adverts',
                'commercial/modules/dfp/get-creative-ids',
                'lib/config',
                'commercial/modules/dfp/performance-logging',
                'commercial/modules/commercial-features',
                'lib/detect',
                'commercial/modules/dfp/dfp-env'
            ], function () {
                dfp = {
                    prepareGoogletag: arguments[0],
                    getAdverts: arguments[1],
                    getCreativeIDs: arguments[2]
                };
                config = arguments[3];
                var performanceLogging = arguments[4];
                commercialFeatures = arguments[5].commercialFeatures;
                detect = arguments[6];
                dfpEnv = arguments[7].dfpEnv;

                config.switches = {
                    commercial:      true,
                    sonobiHeaderBidding: false
                };
                config.page = {
                    adUnit:      '/123456/theguardian.com/front',
                    contentType: 'Article',
                    edition:     'us',
                    isFront:     true,
                    keywordIds:  'world/korea,world/ukraine',
                    pageId:      'world/uk',
                    section:     'news',
                    seriesId:    'learning/series/happy-times',
                    sharedAdTargeting: {
                        ct:      'Article',
                        edition: 'us',
                        k:       ['korea', 'ukraine'],
                        se:      ['happy-times']
                    }
                };
                config.images = {
                    commercial: {}
                };
                config.ophan = {
                    pageViewId: 'dummyOphanPageViewId'
                };

                fixtures.render(fixturesConfig);
                $style = $.create('<style type="text/css"></style>')
                    .html('body:after{ content: "' + breakpoint + '"}')
                    .appendTo('head');
                var pubAds = {
                    listeners: [],
                    addEventListener: sinon.spy(function (eventName, callback) { this.listeners[eventName] = callback; }),
                    setTargeting: sinon.spy(),
                    enableSingleRequest: sinon.spy(),
                    collapseEmptyDivs: sinon.spy(),
                    refresh: sinon.spy()
                },
                sizeMapping = {
                    sizes: [],
                    addSize: sinon.spy(function (width, sizes) {
                        this.sizes.unshift([width, sizes]);
                    }),
                    build: sinon.spy(function () {
                        var tmp = this.sizes;
                        this.sizes = [];
                        return tmp;
                    })
                };
                window.googletag = {
                    cmd: {
                        push: function() {
                            var args = Array.prototype.slice.call(arguments);
                            args.forEach(function(command) {
                                command();
                            });
                        }
                    },
                    pubads: function () {
                        return pubAds;
                    },
                    sizeMapping: function () {
                        return sizeMapping;
                    },
                    defineSlot: sinon.spy(function () { return window.googletag; }),
                    defineOutOfPageSlot: sinon.spy(function () { return window.googletag; }),
                    addService: sinon.spy(function () { return window.googletag; }),
                    defineSizeMapping: sinon.spy(function () { return window.googletag; }),
                    setTargeting: sinon.spy(function () { return window.googletag; }),
                    enableServices: sinon.spy(),
                    display: sinon.spy()
                };
                window.__switch_zero = false;
                performanceLogging.setListeners = function () {
                    // noop
                };

                commercialFeatures.dfpAdvertising = true;

                done();
            });
        });

        afterEach(function () {
            reset();
            fixtures.clean(fixturesConfig.id);
            $style.remove();
            // window.googletag = null;
        });

        it('should exist', function () {
            expect(dfp).toBeDefined();
        });

        describe('when all DFP advertising is disabled', function () {
            beforeEach(function () {
                commercialFeatures.dfpAdvertising = false;
            });

            it('hides all ad slots', function (done) {
                new Promise( function(resolve) {
                    dfp.prepareGoogletag.init(noop, resolve);
                })
                .then(function () {
                    var remainingAdSlots = document.querySelectorAll('.js-ad-slot');
                    expect(remainingAdSlots.length).toBe(0);
                    done();
                });
            });
        });

        it('should get the slots', function (done) {
            new Promise( function(resolve) {
                dfp.prepareGoogletag.init(noop, resolve);
            })
            .then(function () {
                expect(Object.keys(dfp.getAdverts()).length).toBe(4);
                done();
            });
        });

        it('should not get hidden ad slots', function (done) {
            $('.js-ad-slot').first().css('display', 'none');
            new Promise( function(resolve) {
                dfp.prepareGoogletag.init(noop, resolve);
            })
            .then(function () {
                var slots = dfp.getAdverts();
                expect(Object.keys(slots).length).toBe(3);
                for (var slotId in slots) {
                    expect(slotId).not.toBe('dfp-ad-html-slot');
                }
                done();
            });
        });

        it('should set listeners', function (done) {
            new Promise( function(resolve) {
                dfp.prepareGoogletag.init(noop, resolve);
            })
            .then(function () {
                expect(window.googletag.pubads().addEventListener).toHaveBeenCalledWith('slotRenderEnded');
                done();
            });
        });

        it('should define slots', function (done) {
            new Promise( function(resolve) {
                dfp.prepareGoogletag.init(noop, resolve);
            })
            .then(function () {
                [
                    ['dfp-ad-html-slot', [[300, 50]], [[[0, 0], [[300, 50]]]], 'html-slot'],
                    ['dfp-ad-script-slot', [[300, 50], [320, 50]], [[[0, 0], [[300, 50], [320, 50]]]], 'script-slot'],
                    ['dfp-ad-already-labelled', [[728, 90], [300, 50], [320, 50]], [[[740, 0], [[728, 90]]], [[0, 0], [[300, 50], [320, 50]]]], 'already-labelled'],
                    ['dfp-ad-dont-label', [[728, 90], [900, 250], [970, 250], [300, 50], [320, 50]], [[[980, 0], [[728, 90], [900, 250], [970, 250]]], [[740, 0], [[728, 90]]], [[0, 0], [[300, 50], [320, 50]]]], 'dont-label']
                ].forEach(function (data) {
                        expect(window.googletag.defineSlot).toHaveBeenCalledWith('/123456/theguardian.com/front', data[1], data[0]);
                        expect(window.googletag.addService).toHaveBeenCalledWith(window.googletag.pubads());
                        data[2].forEach(function (size) {
                            expect(window.googletag.sizeMapping().addSize).toHaveBeenCalledWith(size[0], size[1]);
                        });
                        expect(window.googletag.defineSizeMapping).toHaveBeenCalledWith(data[2]);
                        expect(window.googletag.setTargeting).toHaveBeenCalledWith('slot', data[3]);
                    });

                done();
            });
        });

        it('should display ads', function (done) {
            config.page.hasPageSkin = true;
            detect.getBreakpoint = function () {
                return 'wide';
            };
            new Promise( function(resolve) {
                dfp.prepareGoogletag.init(noop, resolve);
            })
            .then(function () {
                expect(window.googletag.pubads().enableSingleRequest).toHaveBeenCalled();
                expect(window.googletag.pubads().collapseEmptyDivs).toHaveBeenCalled();
                expect(window.googletag.enableServices).toHaveBeenCalled();
                expect(window.googletag.display).toHaveBeenCalled('dfp-ad-html-slot');
                done();
            });
        });

        it('should be able to create "out of page" ad slot', function (done) {
            $('.js-ad-slot').first().attr('data-out-of-page', true);
            new Promise( function(resolve) {
                dfp.prepareGoogletag.init(noop, resolve);
            })
            .then(function () {
                expect(window.googletag.defineOutOfPageSlot).toHaveBeenCalled();
                done();
            });
        });

        it('should expose ads IDs', function (done) {
            var fakeEventOne = makeFakeEvent('dfp-ad-html-slot'),
                fakeEventTwo = makeFakeEvent('dfp-ad-script-slot');
            fakeEventOne.creativeId = '1';
            fakeEventTwo.creativeId = '2';

            new Promise( function(resolve) {
                dfp.prepareGoogletag.init(noop, resolve);
            })
            .then(function () {
                window.googletag.pubads().listeners.slotRenderEnded(fakeEventOne);
                window.googletag.pubads().listeners.slotRenderEnded(fakeEventTwo);

                var result = dfp.getCreativeIDs();

                expect(result.length).toBe(2);
                expect(result[0]).toEqual('1');
                expect(result[1]).toEqual('2');
                done();
            });
        });

        describe('pageskin loading', function () {

            it('should lazy load ads when there is no pageskin', function () {
                config.page.hasPageSkin = false;
                expect(dfpEnv.shouldLazyLoad()).toBe(true);
            });

            it('should not lazy load ads when there is a pageskin', function () {
                config.page.hasPageSkin = true;
                expect(dfpEnv.shouldLazyLoad()).toBe(false);
            });

        });

        describe('keyword targeting', function () {

            it('should send page level keywords', function (done) {
                new Promise( function(resolve) {
                    dfp.prepareGoogletag.init(noop, resolve);
                })
                .then(function () {
                    expect(window.googletag.pubads().setTargeting).toHaveBeenCalledWith('k', ['korea', 'ukraine']);
                }).then(done).catch(done.fail);
            });

        });
    });
});
