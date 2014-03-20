define([
    'common/$',
    'bean',
    'bonzo',
    'common/modules/adverts/dfp',
    'helpers/fixtures'
], function(
    $,
    bean,
    bonzo,
    DFP,
    fixtures
    ) {


    describe("DFP", function() {
        var style;
        var dfpAds;
        var conf = {
                id: 'article',
                fixtures: [
                            '<p>Motorolas Moto X flagship smartphone goes on sale in the UK and Europe in February, part of its attempt to return to profitability since being acquired by Google.</p>\
                            <div class="ad-slot__dfp">\
                                <div id="dfp-html-slot" class="ad-container"></div>\
                            </div>\
                            <p>Motorola hopes that the launch of the £380 Moto X, which originally went on sale in the US in August 2013, will help move the company back into the black after recording six quarters of losses since it was acquired in May 2012.</p>\
                            <div class="ad-slot__dfp"><div id="dfp-script-slot" class="ad-container"></div></div>\
                            <div class="ad-slot__dfp ad-label--showing"><div id="dfp-already-labelled" class="ad-container"></div>\
                            <div class="ad-slot__dfp" data-label="false"><div id="dfp-dont-label" class="ad-container"></div>\
                            </div>'
                          ]
        };

        var generateSlotFunction = function(name) {
            return {
                getSlotId: function() {
                    return {
                        getDomId: function() {
                            return name;
                        }
                    };
                }
            };
        };

        var createTestIframe = function(id, html) {
            var frame = document.createElement('iframe');
            frame.id = "mock_frame";
            frame.src = 'javascript:"<html><body style="background:transparent"></body></html>"';
            frame.onload = function() {
                this.contentDocument.body.innerHTML = html;
            };
            $('#'+ id).append(frame);
        };

        beforeEach(function() {
            fixtures.render(conf);

            dfpAds = new DFP();

            style = bonzo(bonzo.create('<style type="text/css"></style>'))
                .html('body:after{ content: "wide"}')
                .appendTo('head');
        });

        afterEach(function() {
            fixtures.clean();
            style.remove();
            dfpAds.destroy();
        });

        it("Should find a DFP ad slot", function() {
            dfpAds.init();
            expect(dfpAds.$dfpAdSlots.length).toBe(4);
        });

        it("Should prepend a label", function() {
            var $slot = $('#dfp-html-slot');
            dfpAds.addLabel($slot);
            expect($slot.previous().hasClass('ad-slot__label')).toBe(true);
        });

        it("Should NOT prepend a label when one is already displaying", function() {
            var $slot = $('#dfp-already-labelled');
            dfpAds.addLabel($slot);
            expect($slot.previous().hasClass('ad-slot__label')).toBe(false);
        });

        it("Should NOT prepend a label when the data-label attribute is set to false", function() {
            var $slot = $('#dfp-dont-label');
            dfpAds.addLabel($slot);
            expect($slot.previous().hasClass('ad-slot__label')).toBe(false);
        });

        it("Should map a string to a correct array of sizes", function() {
            var attr;

            attr = '300,50';
            expect(dfpAds.createSizeMapping(attr)).toEqual([[300, 50]]);

            attr = '300,50|320,50';
            expect(dfpAds.createSizeMapping(attr)).toEqual([[300, 50], [320, 50]]);
        });

        describe("Should place the iframe code on to the parent page when", function() {

            it("has content with the class 'breakout__html'", function() {
                var id   = 'dfp-html-slot',
                    slot = generateSlotFunction(id),
                    text = 'This is a test iframe with HTML content',
                    html = '<div class="breakout__html"><div class="dfp-iframe-content">'+ text +'</div></div>';

                createTestIframe(id, html);
                dfpAds.checkForBreakout($('#'+ slot.getSlotId().getDomId()));

                expect($('.dfp-iframe-content').length).toBe(1);
                expect($('.dfp-iframe-content').text()).toBe(text);
            });

            it("has content with the class 'breakout__script'", function() {
                var id   = 'dfp-script-slot',
                    str  = 'This came from an iframe',
                    slot = generateSlotFunction(id),
                    html = '<script class="breakout__script">window.dfpModuleTestVar = "'+ str +'"</script>';

                createTestIframe(id, html);
                dfpAds.checkForBreakout($('#'+ slot.getSlotId().getDomId()));

                expect(window.dfpModuleTestVar).toBe(str);
            });
        });
    });
});
