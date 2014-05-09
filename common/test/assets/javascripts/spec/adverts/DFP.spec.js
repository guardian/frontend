define([
    'common/$',
    'bean',
    'bonzo',
    'qwery',
    'common/modules/adverts/dfp',
    'helpers/fixtures'
], function(
    $,
    bean,
    bonzo,
    qwery,
    DFP,
    fixtures
) {

    describe('DFP', function() {
        var addSizeSpy = sinon.spy(),
            buildSpy = sinon.spy(),
            style,
            dfp,
            conf = {
                id: 'article',
                fixtures: [
                    '<p>Motorolas Moto X flagship smartphone goes on sale in the UK and Europe in February, part of its attempt to return to profitability since being acquired by Google.</p>\
                    <div class="ad-slot--dfp">\
                        <div id="dfp-html-slot" class="ad-slot__container"></div>\
                    </div>\
                    <p>Motorola hopes that the launch of the £380 Moto X, which originally went on sale in the US in August 2013, will help move the company back into the black after recording six quarters of losses since it was acquired in May 2012.</p>\
                    <div class="ad-slot--dfp"><div id="dfp-script-slot" class="ad-slot__container"></div></div>\
                    <div class="ad-slot--dfp ad-label--showing"><div id="dfp-already-labelled" class="ad-slot__container"></div>\
                    <div class="ad-slot--dfp" data-label="false"><div id="dfp-dont-label" class="ad-slot__container"></div></div>'
                ]
            },
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
            },
            createGoogletag = function() {
                return googletag = {
                    cmd: [],
                    sizeMapping: function() {
                        return {
                            build: buildSpy,
                            addSize: addSizeSpy
                        }
                    },
                    defineSlot: function() { return this; },
                    addService: function() { return this; },
                    defineSizeMapping: function() { return this; },
                    setTargeting: function() { return this; },
                    pubads: function() { }
                };
            };

        beforeEach(function() {
            fixtures.render(conf);
            style = $.create('<style type="text/css"></style>')
                .html('body:after{ content: "wide"}')
                .appendTo('head');
            dfp = new DFP();
        });

        afterEach(function() {
            fixtures.clean(conf.id);
            style.remove();
            dfp.destroy();
            window.googletag = null;
        });

        it('should be able to instantiate a DFP object', function() {
            expect(dfp).toBeDefined();
        });

        it('should find a DFP ad slot', function() {
            dfp.init();
            expect(dfp.dfpAdSlots.length).toBe(4);
        });

        describe('Label', function() {

            it('should be rendered', function() {
                var $slot = $('#dfp-html-slot');
                dfp.addLabel($slot);
                expect($slot.previous().hasClass('ad-slot__label')).toBe(true);
            });

            it('should not be rendered twice', function() {
                var $slot = $('#dfp-already-labelled');
                dfp.addLabel($slot);
                expect($slot.previous().hasClass('ad-slot__label')).toBe(false);
            });

            it('should not be rendered if data-label attribute is set to false', function() {
                var $slot = $('#dfp-dont-label');
                dfp.addLabel($slot);
                expect($slot.previous().hasClass('ad-slot__label')).toBe(false);
            });

            it('should remove advert is ad event is empty', function() {
                var id = 'dfp-html-slot',
                    $slot = $('#' + id);
                dfp.addLabel($slot);
                dfp.parseAd({
                    isEmpty: true,
                    slot: {
                        getSlotId: function() {
                            return {
                                getDomId: function() {
                                    return id;
                                }
                            };
                        }
                    }
                });
                expect($('.ad-slot__label', $slot.parent()[0]).length).toBe(0);
            });

        });

        it('should build the size mappings', function() {
            window.googletag = createGoogletag();
            var $slot = $.create('<div></div>')
                .attr({
                    'data-mobile': '300,50|320,50',
                    'data-tabletportrait': '728,90'
                }).each(dfp.defineSlotSizes, dfp);
            expect(addSizeSpy).toHaveBeenCalledWith([0, 0], [[300, 50], [320, 50]]);
            expect(addSizeSpy).toHaveBeenCalledWith([740, 0], [[728, 90]]);
            expect(buildSpy).toHaveBeenCalledOnce();
        });

        describe('should place the iframe code on to the parent page when', function() {

            it('has content with the class "breakout__html"', function() {
                var id   = 'dfp-html-slot',
                    text = 'This is a test iframe with HTML content',
                    html = '<div class="breakout__html"><div class="dfp-iframe-content">'+ text +'</div></div>';

                createTestIframe(id, html);
                dfp.checkForBreakout($('#' + id));

                expect($('.dfp-iframe-content').length).toBe(1);
                expect($('.dfp-iframe-content').text()).toBe(text);
            });

            it('has content with the class "breakout__script"', function() {
                var id   = 'dfp-script-slot',
                    str  = 'This came from an iframe',
                    html = '<script class="breakout__script">window.dfpModuleTestVar = "'+ str +'"</script>';

                createTestIframe(id, html);
                dfp.checkForBreakout($('#' + id));

                expect(window.dfpModuleTestVar).toBe(str);
            });
        });

        it('should be able to define slots', function() {
            // just render a single ad slot
            fixtures.render({
                id: 'article',
                fixtures: [
                    '<div class="ad-slot--dfp" data-name="inline1" data-mobile="300,50|320,50" data-tabletportrait="300,250">' +
                        '<div id="dfp-html-slot" class="ad-slot__container"></div>' +
                    '</div>'
                ]
            });
            window.googletag = createGoogletag();
            var setTargetingSpy = sinon.spy(window.googletag, 'setTargeting'),
                dfp = new DFP({
                    page: {
                        isFront: true,
                        dfpAccountId: 'foo',
                        dfpAdUnitRoot: 'bar'
                    }
                });
            dfp.init();
            dfp.defineSlots();
            expect(addSizeSpy).toHaveBeenCalledWith([0, 0], [[300, 50], [320, 50]]);
            expect(addSizeSpy).toHaveBeenCalledWith([740, 0], [[300, 250]]);
            expect(setTargetingSpy).toHaveBeenCalledWith('slot', 'inline1');
        });

        it('should not create ad if slot is not displayed', function() {
            $('.ad-slot--dfp').first().css('display', 'none');
            dfp.init();
            expect(dfp.dfpAdSlots.length).toBe(3);
            expect(
                dfp.dfpAdSlots
                    .map(function($adSlot) {
                        return $adSlot[0];
                    })
                    .some(function(adSlot) {
                        return adSlot === $('.ad-slot--dfp').first();
                    }
                )
            ).toBe(false);
        });

    });
});
