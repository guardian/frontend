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
                            '<p>Motorolas Moto X flagship smartphone goes on sale in the UK and Europe in February, part of its attempt to return to profitability since being acquired by Google.</p><div id="dfp-html-slot" class="ad-slot__dfp"></div><p>Motorola hopes that the launch of the £380 Moto X, which originally went on sale in the US in August 2013, will help move the company back into the black after recording six quarters of losses since it was acquired in May 2012.</p><div id="dfp-script-slot" class="ad-slot__dfp"></div>'
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
            expect(dfpAds.dfpAdSlots.length).toBe(2);
        });

        describe("Should place the iframe code on to the parent page when", function() {

            it("has content with the class 'breakout__html'", function() {
                var id   = 'dfp-html-slot',
                    slot = generateSlotFunction(id),
                    text = 'This is a test iframe with HTML content',
                    html = '<div class="breakout__html"><div class="dfp-iframe-content">'+ text +'</div></div>';

                dfpAds.init();
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

                dfpAds.init();
                createTestIframe(id, html);
                dfpAds.checkForBreakout($('#'+ slot.getSlotId().getDomId()));

                expect(window.dfpModuleTestVar).toBe(str);
            });
        });
    });
});
