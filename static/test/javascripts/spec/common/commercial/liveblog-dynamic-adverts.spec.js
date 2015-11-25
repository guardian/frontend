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
    var $style;

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

        it('should insert ads every ' + liveblogDynamicAdverts.settings.INTERVAL + 'th block', function () {
            mediator.on('modules:liveblog:slots', function (slots) {
                var candidates = document.querySelectorAll('.js-liveblog-body > *:nth-child(1+'+liveblogDynamicAdverts.settings.INTERVAL+'n)');
                var allSlots = Array.prototype.every.call(candidates, function(c) { return c.classList.contains('ad-slot') });
                expect(allSlots).toBe(true);
            });
            liveblogDynamicAdverts.init();
        });
    });
});
