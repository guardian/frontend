define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'common/modules/commercial/creatives/gu-style-comcontent'
], function (
    qwery,
    $,
    fixtures,
    GustyleComcontent
) {
    var fixturesConfig = {
        id: 'ad-slot',
        fixtures: [
            '<div class="ad-slot"></div>'
        ]
    };

    describe('GU-style Commercial Content', function () {

        var gustyleComcontent,
            $fixturesContainer;

        it('should exist', function () {
            expect(GustyleComcontent).toBeDefined();
        });

        it('can render slot', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            gustyleComcontent = new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style'
            });
            expect(gustyleComcontent).toBeDefined();
        });

        it('ad slot should have text and header at the bottom', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                articleContentPosition: 'bottom'
            }).create().then(function () {
                expect(qwery('.gu-display__content-position--bottom', '.ad-slot').length).toBe(1);
            }).then(done);
        });

        it('ad slot should have text and header on top', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                articleContentPosition: 'top'
            }).create().then(function () {
                expect(qwery('.gu-display__content-position--top', '.ad-slot').length).toBe(1);
            }).then(done);
        });

        it('ad slot should have bright font colour', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                articleContentColor: 'bright'
            }).create().then(function () {
                expect(qwery('.gu-display__content-color--bright', '.ad-slot').length).toBe(4);
            }).then(done);
        });

        it('ad slot should have dark font colour', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                articleContentColor: 'dark'
            }).create().then(function () {
                expect(qwery('.gu-display__content-color--dark', '.ad-slot').length).toBe(4);
            }).then(done);
        });

        it('ad slot should have regular font size header', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                articleHeaderFontSize: 'regular'
            }).create().then(function () {
                expect(qwery('.gu-display__content-size--regular', '.ad-slot').length).toBe(1);
            }).then(done);
        });

        it('ad slot should have big font size header', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                articleHeaderFontSize: 'big'
            }).create().then(function () {
                expect(qwery('.gu-display__content-size--big', '.ad-slot').length).toBe(1);
            }).then(done);
        });

        it('ad slot should have small font size text', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                articleTextFontSize: 'small'
            }).create().then(function () {
                expect(qwery('.gu-display__content-size--small', '.ad-slot').length).toBe(1);
            }).then(done);
        });

        it('ad slot should have big font size text and header', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                articleTextFontSize: 'big',
                articleHeaderFontSize: 'big'
            }).create().then(function () {
                expect(qwery('.gu-display__content-size--big', '.ad-slot').length).toBe(2);
            }).then(done);
        });

        it('ad slot should have logo in the top left corner', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                brandLogoPosition: 'top-left'
            }).create().then(function () {
                expect(qwery('.gu-display__logo-pos--top-left', '.ad-slot').length).toBe(1);
            }).then(done);
        });

        it('ad slot should have logo in the bottom right corner', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                adType: 'gu-style',
                brandLogoPosition: 'bottom-right'
            }).create().then(function () {
                expect(qwery('.gu-display__logo-pos--bottom-right', '.ad-slot').length).toBe(1);
            }).then(done);
        });

    });
});
