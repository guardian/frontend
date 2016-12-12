define([
    'bonzo',
    'helpers/injector',
    'text!fixtures/commercial/ad-slots/im.html',
    'text!fixtures/commercial/ad-slots/inline1.html',
    'text!fixtures/commercial/ad-slots/inline2.html',
    'text!fixtures/commercial/ad-slots/inline3.html',
    'text!fixtures/commercial/ad-slots/right.html',
    'text!fixtures/commercial/ad-slots/right-small.html'
], function (
    bonzo,
    Injector,
    imHtml,
    inline1Html,
    inline2Html,
    inline3Html,
    rightHtml,
    rightSmallHtml
) {
    describe('Create Ad Slot', function () {

        var injector = new Injector(),
            createSlot, config;

        beforeEach(function (done) {
            injector.require(['common/modules/commercial/dfp/create-slot', 'common/utils/config'], function () {
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
                name: 'right',
                type: 'mpu-banner-ad',
                html: rightHtml
            },
            {
                name: 'right-small',
                type: 'mpu-banner-ad',
                html: rightSmallHtml
            },
            {
                name: 'im',
                type: 'im',
                html: imHtml
            },
            {
                name: 'inline1',
                type: 'inline',
                html: inline1Html
            },
            {
                name: 'inline2',
                type: 'inline',
                html: inline2Html
            },
            {
                name: 'inline3',
                type: 'inline',
                html: inline3Html
            }
        ].forEach(function (expectation) {
            it('should create "' + expectation.name + '" ad slot', function () {
                var adSlot = createSlot(expectation.name, expectation.type);

                expect(adSlot.outerHTML).toBe(expectation.html.replace(/\n/g, '').replace(/\s+/g, ' '));
            });
        });

        it('should create "inline1" ad slot for inline-extra slots', function () {
                var adSlot = createSlot('inline-extra', 'inline');

                expect(bonzo(adSlot).hasClass('ad-slot--inline-extra')).toBeTruthy();
            });

    });
});
