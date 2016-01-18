define([
    'common/modules/commercial/liveblog-dynamic-adverts',
    'common/utils/mediator',
    'helpers/fixtures',
    'common/utils/$'
], function (
    liveblogDynamicAdverts,
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
            done();
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
            $style.remove();
        });

        it('should exist', function () {
            expect(liveblogDynamicAdverts).toBeDefined();
        });

        it('should insert ads every 5th block', function () {
            liveblogDynamicAdverts.init().then(function () {
                slotsCounter = body.querySelectorAll('.ad-slot').length;
                var candidates = document.querySelectorAll('.js-liveblog-body > *:nth-child(1+5n)');
                var allSlots =
                    Array.prototype.every.call(candidates, function (c) { return c.classList.contains('ad-slot'); }) &&
                    candidates.length === slotsCounter;
                expect(allSlots).toBe(true);
            });
        });

    });
});
