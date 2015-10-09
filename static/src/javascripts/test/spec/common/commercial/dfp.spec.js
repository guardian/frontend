/*eslint-disable no-multi-str*/
import fastdom from 'fastdom';
import sinon from 'sinonjs';
import qwery from 'qwery';
import $ from 'common/utils/$';
import fixtures from 'helpers/fixtures';
import Injector from 'helpers/injector';

describe('DFP', function () {

    var $style,
        breakpoint = 'wide',
        fixturesConfig = {
            id: 'article',
            fixtures: [
                // jscs:disable disallowMultipleLineStrings
                '<div id="dfp-ad-html-slot" class="js-ad-slot" data-name="html-slot" data-mobile="300,50"></div>\
                <div id="dfp-ad-script-slot" class="js-ad-slot" data-name="script-slot" data-mobile="300,50|320,50" data-refresh="false"></div>\
                <div id="dfp-ad-already-labelled" class="js-ad-slot ad-label--showing" data-name="already-labelled" data-mobile="300,50|320,50"  data-tablet="728,90"></div>\
                <div id="dfp-ad-dont-label" class="js-ad-slot" data-label="false" data-name="dont-label" data-mobile="300,50|320,50"  data-tablet="728,90" data-desktop="728,90|900,250|970,250"></div>'
                // jscs:enable disallowMultipleLineStrings
            ]
        },
        makeFakeEvent = function (id, isEmpty) {
            return {
                isEmpty: isEmpty,
                slot: {
                    getSlotId: function () {
                        return {
                            getDomId: function () {
                                return id;
                            }
                        };
                    }
                },
                size: ['300', '250']
            };
        },
        injector = new Injector(),
        dfp, config, detect, commercialFeatures;

    beforeEach(function (done) {

        injector.test([
            'common/modules/commercial/dfp',
            'common/utils/config',
            'common/modules/commercial/dfp-ophan-tracking',
            'common/modules/commercial/commercial-features',
            'common/utils/detect'
        ], function () {
            dfp = arguments[0];
            config = arguments[1];
            let ophanTracking = arguments[2];
            commercialFeatures = arguments[3];
            detect = arguments[4];

            config.switches = {
                commercialComponents: true,
                standardAdverts:      true
            };
            config.page = {
                adUnit:      '/123456/theguardian.com/front',
                contentType: 'Article',
                edition:     'us',
                isFront:     true,
                keywordIds:  'world/korea,world/ukraine',
                pageId:      'world/uk',
                section:     'news',
                seriesId:    'learning/series/happy-times'
            };
            config.images = {
                commercial: {}
            };

            fixtures.render(fixturesConfig);
            $style = $.create('<style type="text/css"></style>')
                .html('body:after{ content: "' + breakpoint + '"}')
                .appendTo('head');
            var pubAds = {
                listener: undefined,
                addEventListener: sinon.spy(function (eventName, callback) { this.listener = callback; }),
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
                cmd: [],
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
                display: sinon.spy(),
                displayLazyAds: sinon.spy(function () { return window.googletag; }),
                displayAds: sinon.spy(function () { return window.googletag; })
            };
            //jscs:disable disallowEmptyBlocks
            ophanTracking.trackPerformance = ()=> {
                // noop
            };
            //jscs:enable disallowEmptyBlocks

            commercialFeatures.dfpAdvertising = true;

            done();
        });
    });

    afterEach(function () {
        dfp.reset();
        fixtures.clean(fixturesConfig.id);
        $style.remove();
        window.googletag = null;
    });

    it('should exist', function () {
        expect(dfp).toBeDefined();
    });

    it('should return dfp object on init', function () {
        expect(dfp.init()).toBe(dfp);
    });

    describe('when all DFP advertising is disabled', function () {
        beforeEach(function () {
            commercialFeatures.dfpAdvertising = false;
        });

        it('hides all ad slots', function () {
            dfp.init();
            const remainingAdSlots = document.querySelectorAll('.js-ad-slot');
            expect(remainingAdSlots.length).toBe(0);
        });

        it('still returns a DFP object', function () {
            const returnValue = dfp.init();
            expect(returnValue).toBe(dfp);
        });
    });

    it('should get the slots', function () {
        dfp.init();
        window.googletag.cmd.forEach(function (func) { func(); });
        expect(Object.keys(dfp.getSlots()).length).toBe(4);
    });

    it('should not get hidden ad slots', function () {
        $('.js-ad-slot').first().css('display', 'none');
        dfp.init();
        window.googletag.cmd.forEach(function (func) { func(); });
        var slots = dfp.getSlots();
        expect(Object.keys(slots).length).toBe(3);
        for (var slotId in slots) {
            expect(slotId).not.toBe('dfp-ad-html-slot');
        }
    });

    it('should set listeners', function () {
        dfp.init();
        window.googletag.cmd.forEach(function (func) { func(); });
        expect(window.googletag.pubads().addEventListener).toHaveBeenCalledWith('slotRenderEnded');
    });

    it('should define slots', function () {
        dfp.init();
        window.googletag.cmd.forEach(function (func) { func(); });

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
    });

    it('should display ads', function () {
        dfp.init();
        window.googletag.cmd.forEach(function (func) { func(); });
        expect(window.googletag.pubads().enableSingleRequest).toHaveBeenCalled();
        expect(window.googletag.pubads().collapseEmptyDivs).toHaveBeenCalled();
        expect(window.googletag.enableServices).toHaveBeenCalled();
        expect(window.googletag.display).toHaveBeenCalled('dfp-ad-html-slot');
    });

    it('should be able to create "out of page" ad slot', function () {
        $('.js-ad-slot').first().attr('data-out-of-page', true);
        dfp.init();
        window.googletag.cmd.forEach(function (func) { func(); });
        expect(window.googletag.defineOutOfPageSlot).toHaveBeenCalledWith('/123456/theguardian.com/front', 'dfp-ad-html-slot');
    });

    describe('pageskin loading', function () {

        it('should lazy load ads when there is no pageskin', function () {
            detect.getBreakpoint = function () {
                return 'wide';
            };
            config.switches.viewability = true;
            config.page.hasPageSkin = false;
            expect(dfp.shouldLazyLoad()).toBe(true);
        });

        it('should lazy load ads when there is a pageskin and breakpoint is lower than wide', function () {
            detect.getBreakpoint = function () {
                return 'desktop';
            };
            config.switches.viewability = true;
            config.page.hasPageSkin = true;
            expect(dfp.shouldLazyLoad()).toBe(true);
        });

        it('should not lazy load ads when there is a pageskin and breakpoint is wide', function () {
            detect.getBreakpoint = function () {
                return 'wide';
            };
            config.switches.viewability = true;
            config.page.hasPageSkin = true;
            expect(dfp.shouldLazyLoad()).toBe(false);
        });

    });

    describe('keyword targeting', function () {

        it('should send page level keywords', function () {
            dfp.init();
            window.googletag.cmd.forEach(function (func) { func(); });
            expect(window.googletag.pubads().setTargeting).toHaveBeenCalledWith('k', ['korea', 'ukraine']);
        });

        it('should send container level keywords', function () {
            $('.js-ad-slot').first().attr('data-keywords', 'country/china');
            dfp.init();
            window.googletag.cmd.forEach(function (func) { func(); });
            expect(window.googletag.setTargeting).toHaveBeenCalledWith('k', ['china']);
        });

    });

    describe('labelling', function () {

        var slotId = 'dfp-ad-html-slot';

        it('should be added', function (done) {
            var $slot = $('#' + slotId);
            dfp.init();

            fastdom.defer(function () {
                window.googletag.cmd.forEach(function (func) { func(); });
                window.googletag.pubads().listener(makeFakeEvent(slotId));
                fastdom.defer(function () {
                    expect($('.ad-slot__label', $slot[0]).text()).toBe('Advertisement');
                    done();
                });
            });
        });

        it('should not be added if data-label attribute is false', function () {
            var $slot = $('#' + slotId).attr('data-label', false);
            dfp.init();
            window.googletag.cmd.forEach(function (func) { func(); });
            window.googletag.pubads().listener(makeFakeEvent(slotId));
            expect($('.ad-slot__label', $slot[0]).length).toBe(0);
        });

        it('should be added only once', function (done) {
            var fakeEvent = makeFakeEvent(slotId),
                $slot = $('#' + slotId);
            dfp.init();

            fastdom.defer(function () {
                window.googletag.cmd.forEach(function (func) { func(); });
                window.googletag.pubads().listener(fakeEvent);
                window.googletag.pubads().listener(fakeEvent);

                fastdom.defer(function () {
                    expect($('.ad-slot__label', $slot[0]).length).toBe(1);
                    done();
                });
            });
        });
    });

    describe('breakout', function () {

        var slotId = 'dfp-ad-html-slot',
            createTestIframe = function (id, html) {
                var $frame = $.create('<iframe></iframe>')
                    .attr({
                        id: 'mock_frame',
                        /*eslint-disable no-script-url*/
                        src: 'javascript:"<html><body style="background:transparent"></body></html>"'
                        /*eslint-enable no-script-url*/
                    });
                $frame[0].onload = function () {
                    this.contentDocument.body.innerHTML = html;
                };
                $frame.appendTo(qwery('#' + id)[0]);
            };

        it('should insert html', function (done) {
            var html = '<div class="dfp-iframe-content">Some content</div>';
            $('#' + slotId).attr('data-label', false);
            createTestIframe(slotId, '<div class="breakout__html">' + html + '</div>');
            dfp.init();

            fastdom.defer(function () {
                window.googletag.cmd.forEach(function (func) { func(); });
                window.googletag.pubads().listener(makeFakeEvent(slotId));

                fastdom.defer(function () {
                    expect($('iframe', '#' + slotId).css('display')).toBe('none');
                    done();
                });
            });
        });

        // TODO: find a nice way to test this
        xit('should run javascript', function () {
            var str = 'This came from an iframe';
            createTestIframe(slotId, '<script class="breakout__script">window.dfpModuleTestVar = "' + str + '"</script>');
            dfp.init();
            window.googletag.cmd.forEach(function (func) { func(); });
            window.googletag.pubads().listener(makeFakeEvent(slotId));
            expect(window.dfpModuleTestVar).toBe(str);
        });
    });
});
