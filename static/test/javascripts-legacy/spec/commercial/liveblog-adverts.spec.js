define([
    'lib/mediator',
    'helpers/injector',
    'helpers/fixtures',
    'lib/$'
], function (
    mediator,
    Injector,
    fixtures,
    $
) {
    var $style, body;
    var slotsCounter, liveblogAdverts, commercialFeatures;

    var injector = new Injector();

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
            injector.require([
                'commercial/modules/liveblog-adverts',
                'commercial/modules/commercial-features',
            ], function($1, $2) {
                liveblogAdverts = $1;
                commercialFeatures = $2;
                fixtures.render(fixturesConfig);
                body = document.querySelector('.js-liveblog-body');
                $style = $.create('<style type="text/css"></style>')
                    .html('.block{ height: 1200px }')
                    .appendTo('head');
                commercialFeatures.commercialFeatures.liveblogAdverts = true;

                afterEach(function () {
                    fixtures.clean(fixturesConfig.id);
                });

                done();
            },
            done.fail);

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
