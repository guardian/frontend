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
    var firstAd, slotsCounter;

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

        it('should insert ads every ' + liveblogDynamicAdverts.settings.INTERVAL + 'th block', function () {
            liveblogDynamicAdverts.onLoad().then(function () {
                slotsCounter = body.querySelectorAll('.ad-slot').length;
                var candidates = document.querySelectorAll('.js-liveblog-body > *:nth-child(1+' + liveblogDynamicAdverts.settings.INTERVAL + 'n)');
                var allSlots =
                    Array.prototype.every.call(candidates, function (c) { return c.classList.contains('ad-slot'); }) &&
                    candidates.length === slotsCounter;
                firstAd = body.children[1];
                expect(allSlots).toBe(true);
            });
        });

        it('should insert ads every ' + liveblogDynamicAdverts.settings.INTERVAL + 'th block after an update', function () {
            for (var i = 0; i < 12; i++) {
                var d = document.createElement('div');
                d.classList.add('block');
                body.insertBefore(d, body.firstChild);
            }

            liveblogDynamicAdverts.onUpdate([0]).then(function () {
                var candidates = [];
                var ncur = firstAd;
                var index = 0;
                var nprev;

                while ((nprev = ncur.previousElementSibling)) {
                    index += 1;
                    if (index % (liveblogDynamicAdverts.settings.INTERVAL + 1) === 0) {
                        candidates.push(nprev);
                    }
                    ncur = nprev;
                }
                var allSlots = Array.prototype.every.call(candidates, function (c) { return c.classList.contains('ad-slot'); }) &&
                    candidates.length === body.querySelectorAll('.ad-slot').length - slotsCounter;
                expect(allSlots).toBe(true);
            });
        });
    });
});
