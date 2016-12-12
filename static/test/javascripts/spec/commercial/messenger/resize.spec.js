define([
    'helpers/fixtures',
    'helpers/injector'
], function (
    fixtures,
    Injector
) {
    describe('Cross-frame messenger: resize', function () {
        var resize;

        var fixturesConfig = {
            id: 'resize-page',
            fixtures: [
                '<div class="js-ad-slot"><div id="iframe11" class="iframe" data-unit="%"></div></div>',
                '<div class="js-ad-slot"><div id="iframe10" class="iframe" data-unit="px"></div></div>',
                '<div class="js-ad-slot"><div id="iframe09" class="iframe" data-unit="ch"></div></div>',
                '<div class="js-ad-slot"><div id="iframe08" class="iframe" data-unit="em"></div></div>',
                '<div class="js-ad-slot"><div id="iframe07" class="iframe" data-unit="rem"></div></div>',
                '<div class="js-ad-slot"><div id="iframe06" class="iframe" data-unit="vmin"></div></div>',
                '<div class="js-ad-slot"><div id="iframe05" class="iframe" data-unit="vmax"></div></div>',
                '<div class="js-ad-slot"><div id="iframe04" class="iframe" data-unit="vh"></div></div>',
                '<div class="js-ad-slot"><div id="iframe03" class="iframe" data-unit="vw"></div></div>',
                '<div class="js-ad-slot"><div id="iframe02" class="iframe" data-unit="ex"></div></div>',
                '<div class="js-ad-slot"><div id="iframe01" class="iframe"></div></div>'
            ]
        };

        var injector = new Injector();
        injector.mock('commercial/modules/messenger', {
            register: function () {}
        });

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/messenger/resize'
            ], function($1) {
                resize = $1;
                fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should return nothing if specs are empty', function () {
            expect(resize({})).toBeNull();
            expect(resize({ dontcare: 'hello' })).toBeNull();
        });

        it('should set width and height of the ad slot', function (done) {
            var iframe = document.getElementById('iframe01');
            var adSlot = iframe.parentNode;
            resize({ width: '10', height: '10' }, iframe, adSlot)
            .then(function () {
                expect(iframe.style.height).toBe('10px');
                expect(iframe.style.width).toBe('10px');
                expect(adSlot.style.height).toBe('10px');
                expect(adSlot.style.width).toBe('10px');
            })
            .then(done)
            .catch(done.fail);
        });

        it('should accept all relative units', function (done) {
            var iframes = Array.prototype.slice.call(document.querySelectorAll('.iframe[data-unit]'));
            Promise.all(
                iframes
                .map(function (iframe) {
                    return resize({ height: '10' + iframe.dataset.unit }, iframe, iframe.parentNode)
                    .then(function () {
                        expect(iframe.parentNode.style.height).toBe('10' + iframe.dataset.unit);
                    });
                })
            )
            .then(done)
            .catch(done.fail);
        });
    });
});
