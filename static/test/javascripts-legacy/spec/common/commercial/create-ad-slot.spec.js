define([
    'bonzo',
    'helpers/injector',
    'commercial/modules/ad-sizes',
    'raw-loader!fixtures/commercial/ad-slots/im.html',
    'raw-loader!fixtures/commercial/ad-slots/inline1.html',
    'raw-loader!fixtures/commercial/ad-slots/right.html',
    'raw-loader!fixtures/commercial/ad-slots/right-small.html'
], function (
    bonzo,
    Injector,
    adSizes,
    imHtml,
    inline1Html,
    rightHtml,
    rightSmallHtml
) {
    describe('Create Ad Slot', function () {

        var injector = new Injector(),
            createSlot, config;

        beforeEach(function (done) {
            injector.require(['commercial/modules/dfp/create-slot', 'lib/config'], function () {
                createSlot = arguments[0];
                config = arguments[1];

                config.page = {
                    edition: 'UK'
                };
                done();
            });
        });

        it('should exist', function () {
            expect(createSlot).toBeDefined();
        });

        [
            {
                type: 'right',
                classes: 'mpu-banner-ad',
                html: rightHtml
            },
            {
                type: 'right-small',
                classes: 'mpu-banner-ad',
                html: rightSmallHtml
            },
            {
                type: 'im',
                html: imHtml
            },
            {
                type: 'inline',
                classes: 'inline',
                name: 'inline1',
                html: inline1Html
            }
        ].forEach(function (expectation) {
            it('should create "' + expectation.type + '" ad slot', function () {
                var adSlot = createSlot(expectation.type, { name: expectation.name, classes: expectation.classes });

                expect(adSlot.outerHTML).toBe(expectation.html.replace(/\n/g, '').replace(/\s+/g, ' '));
            });
        });

        it('should create "inline1" ad slot for inline-extra slots', function () {
            var adSlot = createSlot('inline', { classes: 'inline-extra' });

            expect(bonzo(adSlot).hasClass('ad-slot--inline-extra')).toBeTruthy();
        });

        it('should create "inline1" ad slot with additional size', function () {
            var adSlot = createSlot('inline', { sizes: { desktop: [ adSizes.leaderboard ]} });

            expect(bonzo(adSlot).attr('data-desktop').indexOf(adSizes.leaderboard.toString())).toBeTruthy();
        });

    });
});
