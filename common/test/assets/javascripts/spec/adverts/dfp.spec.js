define([
    'common/$',
    'bean',
    'bonzo',
    'qwery',
    'common/modules/adverts/dfp',
    'helpers/fixtures',
    'common/utils/mediator'
], function(
    $,
    bean,
    bonzo,
    qwery,
    dfp,
    fixtures,
    mediator
) {

    describe('DFP', function() {
        var $style,
            breakpoint = 'wide',
            conf = {
                id: 'article',
                fixtures: [
                    '<div id="dfp-ad-html-slot" class="ad-slot--dfp" data-name="html-slot" data-mobile="300,50"></div>\
                    <div id="dfp-ad-script-slot" class="ad-slot--dfp" data-name="script-slot" data-mobile="300,50|320,50" data-refresh="false"></div>\
                    <div id="dfp-ad-already-labelled" class="ad-slot--dfp ad-label--showing" data-name="already-labelled" data-mobile="300,50|320,50"  data-tabletportrait="728,90"></div>\
                    <div id="dfp-ad-dont-label" class="ad-slot--dfp" data-label="false" data-name="dont-label" data-mobile="300,50|320,50"  data-tabletportrait="728,90" data-desktop="728,90|900,250|970,250"></div>'
                ]
            },
            makeFakeEvent = function(id, isEmpty) {
                return {
                    isEmpty: isEmpty,
                    slot: {
                        getSlotId: function() {
                            return {
                                getDomId: function() {
                                    return id;
                                }
                            }
                        }
                    }
                }
            };

        beforeEach(function() {
            fixtures.render(conf);
            $style = $.create('<style type="text/css"></style>')
                .html('body:after{ content: "' + breakpoint + '"}')
                .appendTo('head');
            var pubAds = {
                    listener: undefined,
                    addEventListener: sinon.spy(function(eventName, callback) { this.listener = callback; }),
                    setTargeting: sinon.spy(),
                    enableSingleRequest: sinon.spy(),
                    collapseEmptyDivs: sinon.spy(),
                    refresh: sinon.spy()
                },
                sizeMapping = {
                    sizes: [],
                    addSize: sinon.spy(function(width, sizes) {
                        this.sizes.unshift([width, sizes]);
                    }),
                    build: sinon.spy(function() {
                        var tmp = this.sizes;
                        this.sizes = [];
                        return tmp;
                    })
                };
            window.googletag = {
                cmd: [],
                pubads: function() {
                    return pubAds;
                },
                sizeMapping: function() {
                    return sizeMapping;
                },
                defineSlot: sinon.spy(function() { return window.googletag; }),
                defineOutOfPageSlot: sinon.spy(function() { return window.googletag; }),
                addService: sinon.spy(function() { return window.googletag; }),
                defineSizeMapping: sinon.spy(function() { return window.googletag; }),
                setTargeting: sinon.spy(function() { return window.googletag; }),
                enableServices: sinon.spy(),
                display: sinon.spy()
            };
        });

        afterEach(function() {
            fixtures.clean(conf.id);
            $style.remove();
            window.googletag = null;
            dfp.reset();
        });

        it('should return dfp object on init', function() {
            expect(dfp.init()).toBe(dfp);
        });

        it('should get the ad slots', function() {
            var adSlots = dfp.init().getAdSlots();
            expect(adSlots.length).toBe(4);
        });

        it('should not get hidden ad slots', function() {
            var hiddenSlot = $('.ad-slot--dfp').first().css('display', 'none')[0],
                adSlots = dfp.init().getAdSlots();
            expect(adSlots.length).toBe(3);
            adSlots.forEach(function($adSlot) {
                expect($adSlot[0]).not.toBe(hiddenSlot);
            })
        });

        it('should set listeners', function() {
            dfp.init();
            window.googletag.cmd.forEach(function(func) { func(); });
            expect(googletag.pubads().addEventListener).toHaveBeenCalledWith('slotRenderEnded');
        });

        it('should build correct page targeting', function() {
            var page = {
                section: 'news',
                series: 'happy times',
                contentType: 'Article',
                edition: 'us'
            };
            dfp.init({ page: page });
            window.googletag.cmd.forEach(function(func) { func(); });
            // expected targetting
            [
                ['edition', 'us'],
                ['cat', 'news'],
                ['se', 'happy-times'],
                ['ct', 'article'],
                ['pt', 'article'],
                ['p', 'ng'],
                ['bp', breakpoint]
            ].forEach(function(target) {
                expect(googletag.pubads().setTargeting).toHaveBeenCalledWith(target[0], target[1]);
            });
        });

        it('should define slots', function() {
            dfp.init({
                page: {
                    dfpAccountId: 123456,
                    dfpAdUnitRoot: 'theguardian.com',
                    isFront: true,
                    section: ''
                }
            });
            window.googletag.cmd.forEach(function(func) { func(); });

            [
                ['dfp-ad-html-slot', [[300, 50]], [ [[0, 0], [[300, 50]]] ], 'html-slot'],
                ['dfp-ad-script-slot', [[300, 50], [320, 50]], [ [[0, 0], [[300, 50], [320, 50]]] ], 'script-slot'],
                ['dfp-ad-already-labelled', [[728, 90], [300, 50], [320, 50]], [ [[740, 0], [[728, 90]]], [[0, 0], [[300, 50], [320, 50]]] ], 'already-labelled'],
                ['dfp-ad-dont-label', [[728, 90], [900, 250], [970, 250], [300, 50], [320, 50]], [ [[980, 0], [[728, 90], [900, 250], [970, 250]]], [[740, 0], [[728, 90]]], [[0, 0], [[300, 50], [320, 50]]] ], 'dont-label']
            ].forEach(function(data) {
                    expect(window.googletag.defineSlot).toHaveBeenCalledWith('/123456/theguardian.com/front', data[1], data[0]);
                    expect(window.googletag.addService).toHaveBeenCalledWith(googletag.pubads());
                    data[2].forEach(function(size) {
                        expect(window.googletag.sizeMapping().addSize).toHaveBeenCalledWith(size[0], size[1]);
                    });
                    expect(window.googletag.defineSizeMapping).toHaveBeenCalledWith(data[2]);
                    expect(window.googletag.setTargeting).toHaveBeenCalledWith('slot', data[3]);
                });
        });

        it('should refresh on breakpoint changed', function() {
            dfp.init();
            window.googletag.cmd.forEach(function(func) { func(); });
            // change breakpoint
            $style.html('body:after { content: "mobile"; }');
            // 'resize'
            mediator.emit('window:resize');
            waitsFor(function() {
                return googletag.pubads().refresh.called;
            });
            runs(function() {
                expect(googletag.pubads().refresh.firstCall.args[0].length).toBe(3);
            })
        });

        it('should display ads', function() {
            dfp.init();
            window.googletag.cmd.forEach(function(func) { func(); });
            expect(window.googletag.pubads().enableSingleRequest).toHaveBeenCalled();
            expect(window.googletag.pubads().collapseEmptyDivs).toHaveBeenCalled();
            expect(window.googletag.enableServices).toHaveBeenCalled();
            expect(window.googletag.display).toHaveBeenCalled('dfp-ad-html-slot');
        });

        describe('create ad', function() {

            [
                {
                    name: 'right',
                    type: 'mpu-banner-ad',
                    html: '<div id="dfp-ad--right" class="ad-slot ad-slot--dfp ad-slot--right ad-slot--mpu-banner-ad" ' +
                        'data-link-name="ad slot right" data-name="right" data-tabletlandscape="300,250|300,600"></div>'
                },
                {
                    name: 'inline1',
                    type: 'inline',
                    html: '<div id="dfp-ad--inline1" class="ad-slot ad-slot--dfp ad-slot--inline1 ad-slot--inline" ' +
                        'data-link-name="ad slot inline1" data-name="inline1" data-mobile="300,50" ' +
                        'data-mobilelandscape="300,50|320,50" data-tabletportrait="300,250"></div>'
                },
                {
                    name: 'inline2',
                    type: 'inline',
                    html: '<div id="dfp-ad--inline2" class="ad-slot ad-slot--dfp ad-slot--inline2 ad-slot--inline" ' +
                        'data-link-name="ad slot inline2" data-name="inline2" data-mobile="300,50" ' +
                        'data-mobilelandscape="300,50|320,50" data-tabletportrait="300,250"></div>'
                },
                {
                    name: 'merchandising-high',
                    type: 'commercial-component',
                    html: '<div id="dfp-ad--merchandising-high" class="ad-slot ad-slot--dfp ad-slot--merchandising-high ad-slot--commercial-component" ' +
                        'data-link-name="ad slot merchandising-high" data-name="merchandising-high" data-desktop="888,88" ' +
                        'data-refresh="false" data-label="false"></div>'
                },
                {
                    name: 'adbadge',
                    type: 'paid-for-badge',
                    html: '<div id="dfp-ad--adbadge" class="ad-slot ad-slot--dfp ad-slot--adbadge ad-slot--paid-for-badge" ' +
                        'data-link-name="ad slot adbadge" data-name="adbadge" data-mobile="140,90" ' +
                        'data-refresh="false" data-label="false"></div>'
                },
                {
                    name: 'spbadge',
                    type: 'paid-for-badge',
                    html: '<div id="dfp-ad--spbadge" class="ad-slot ad-slot--dfp ad-slot--spbadge ad-slot--paid-for-badge" ' +
                        'data-link-name="ad slot spbadge" data-name="spbadge" data-mobile="140,90" ' +
                        'data-refresh="false" data-label="false"></div>'
                }
            ].forEach(function(expectation) {
                it('should create "' + expectation.name + '" ad slot', function() {
                    var adSlot = dfp.createAdSlot(expectation.name, expectation.type);
                    expect(adSlot.outerHTML).toBe(expectation.html)
                });
            });

            it('should accept multiple types', function() {
                var types = ['paid-for-badge', 'paid-for-badge--container'],
                    adSlot = dfp.createAdSlot('adbadge', ['paid-for-badge', 'paid-for-badge--container']);
                types.forEach(function(type) {
                    expect(bonzo(adSlot).hasClass('ad-slot--' + type)).toBeTruthy();
                });
            });

        });

        it('should be able to create "out of page" ad slot', function() {
            $('.ad-slot--dfp').first().data('out-of-page', true);
            dfp.init({
                page: {
                    dfpAccountId: 123456,
                    dfpAdUnitRoot: 'theguardian.com',
                    isFront: true,
                    section: ''
                }
            });
            window.googletag.cmd.forEach(function(func) { func(); });
            expect(window.googletag.defineOutOfPageSlot).toHaveBeenCalledWith('/123456/theguardian.com/front', 'dfp-ad-html-slot');
        });

        describe('keyword targeting', function() {

            it('should send page level keywords', function() {
                dfp.init({
                    page: {
                        keywordIds: 'world/korea,world/ukraine'
                    }
                });
                window.googletag.cmd.forEach(function(func) { func(); });
                expect(window.googletag.setTargeting).toHaveBeenCalledWith('k', ['korea', 'ukraine']);
            });

            it('should send container level keywords', function() {
                $('.ad-slot--dfp').first().data('keywords', 'china');
                dfp.init();
                window.googletag.cmd.forEach(function(func) { func(); });
                expect(window.googletag.setTargeting).toHaveBeenCalledWith('k', ['china']);
            });

            it('should use pageId if no keywords ', function() {
                dfp.init({
                    page: {
                        pageId: 'world/uk'
                    }
                });
                window.googletag.cmd.forEach(function(func) { func(); });
                expect(window.googletag.setTargeting).toHaveBeenCalledWith('k', ['uk']);
            });

        });


        describe('labelling', function() {

            var slotId = 'dfp-ad-html-slot';

            it('should be added', function() {
                var $slot = $('#' + slotId);
                dfp.init();
                window.googletag.cmd.forEach(function(func) { func(); });
                window.googletag.pubads().listener(makeFakeEvent(slotId));
                expect($('.ad-slot__label', $slot[0]).text()).toBe('Advertisement');
            });

            it('should not be added if data-label attribute is false', function() {
                var $slot = $('#' + slotId).data('label', false);
                dfp.init();
                window.googletag.cmd.forEach(function(func) { func(); });
                window.googletag.pubads().listener(makeFakeEvent(slotId));
                expect($('.ad-slot__label', $slot[0]).length).toBe(0);
            });

            it('should be added only once', function() {
                var fakeEvent = makeFakeEvent(slotId),
                    $slot = $('#' + slotId);
                dfp.init();
                window.googletag.cmd.forEach(function(func) { func(); });
                window.googletag.pubads().listener(fakeEvent);
                window.googletag.pubads().listener(fakeEvent);
                expect($('.ad-slot__label', $slot[0]).length).toBe(1);
            });

        });

        describe('breakout', function() {

            var slotId = 'dfp-ad-html-slot',
                createTestIframe = function(id, html) {
                    var $frame = $.create('<iframe></iframe>')
                        .attr({
                            id: 'mock_frame',
                            src: 'javascript:"<html><body style="background:transparent"></body></html>"'
                        });
                    $frame[0].onload = function() {
                        this.contentDocument.body.innerHTML = html;
                    };
                    $frame.appendTo(qwery('#' + id)[0]);
                };

            it('should insert html', function() {
                var html = '<div class="dfp-iframe-content">Some content</div>',
                    $slot = $('#' + slotId).data('label', false);
                createTestIframe(slotId, '<div class="breakout__html">' + html + '</div>');
                dfp.init();
                window.googletag.cmd.forEach(function(func) { func(); });
                window.googletag.pubads().listener(makeFakeEvent(slotId));
                expect($('#' + slotId).html()).toBe('<div class="dfp-iframe-content">Some content</div>');
            });

            it('should run javascript', function() {
                var str = 'This came from an iframe';
                createTestIframe(slotId, '<script class="breakout__script">window.dfpModuleTestVar = "'+ str +'"</script>');
                dfp.init();
                window.googletag.cmd.forEach(function(func) { func(); });
                window.googletag.pubads().listener(makeFakeEvent(slotId));
                expect(window.dfpModuleTestVar).toBe(str);
            });

        });

    });
});
