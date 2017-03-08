define([
    'commercial/modules/liveblog-adverts',
    'commercial/modules/commercial-features',
    'lib/mediator',
    'helpers/fixtures',
    'lib/$'
], function (
    liveblogAdverts,
    commercialFeatures,
    mediator,
    fixtures,
    $
) {
    var $style, body;
    var slotsCounter;

    describe('Liveblog Dynamic Adverts', function () {
        var fixturesConfig = {
            id: 'liveblog-body',
            fixtures: [
                '<div class="js-liveblog-body">' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '<div class="block"></div>' +
                '</div>'
            ]
        };

        beforeEach(function (done) {
            fixtures.render(fixturesConfig);
            body = document.querySelector('.js-liveblog-body');
            $style = $.create('<style type="text/css"></style>')
                .html('.block{ height: 1200px }')
                .appendTo('head');
            commercialFeatures.liveblogAdverts = true;

            afterEach(function () {
                fixtures.clean(fixturesConfig.id);
            });

            done();
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
            $style.remove();
        });

        it('should exist', function () {
            expect(liveblogAdverts).toBeDefined();
        });

        xit('should insert ads every 5th block', function (done) {
            liveblogAdverts.init().then(function () {
                slotsCounter = body.querySelectorAll('.ad-slot').length;
                var candidates = document.querySelectorAll('.js-liveblog-body > *:nth-child(1+5n)');
                var allSlots =
                    Array.prototype.every.call(candidates, function (c) { return c.classList.contains('ad-slot'); }) &&
                    candidates.length === slotsCounter;
                expect(allSlots).toBe(true);
            }).then(done).catch(done.fail);
        });

    });
});
