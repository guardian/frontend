define([
    'lib/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    $,
    fixtures,
    Injector
) {
    describe('Cross-frame messenger: get stylesheets', function () {
        var getStyles, styleSheets;

        var fixturesConfig = {
            id: 'get-style-sheet-page',
            fixtures: [
                '<style class="webfont"></style>',
                '<style class="webfont" data-cache-name="GuardianSansWeb"></style>',
                '<style class="webfont" data-cache-name="GuardianSansTextWeb"></style>',
                '<style class="notawebfont"></style>'
            ]
        };

        var injector = new Injector();
        injector.mock('commercial/modules/messenger', {
            register: function () {}
        });

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/messenger/get-stylesheet'
            ], function($1) {
                getStyles = $1.getStyles;
                fixtures.render(fixturesConfig);
                styleSheets = Array.prototype.map.call(document.querySelectorAll('style'), function (style) {
                    return Object.assign({
                        ownerNode: Object.assign({
                            matches: function(selector) {
                                var res = Array.prototype.slice.call(document.querySelectorAll(selector));
                                return res.indexOf(style) > -1;
                            }
                        }, style)
                    }, style);
                });
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should return nothing if there isn\'t at least a CSS selector', function () {
            expect(getStyles({})).toBeNull();
            expect(getStyles({ dontcare: 'hello' })).toBeNull();
        });

        it('should return all webfonts available', function () {
            var result = getStyles({ selector: '.webfont' }, styleSheets);
            expect(result).not.toBeNull();
            expect(result.length).toBe($('.webfont').length);
        });

        it('should return only the GuardianSansWeb webfont', function () {
            var result = getStyles({ selector: '.webfont[data-cache-name="GuardianSansWeb"]' }, styleSheets);
            expect(result).not.toBeNull();
            expect(result.length).toBe($('.webfont[data-cache-name="GuardianSansWeb"]').length);
        });

        it('should return only the GuardianSansWeb and GuardianSansTextWeb webfonts', function () {
            var selector = '.webfont[data-cache-name="GuardianSansWeb"], .webfont[data-cache-name="GuardianSansWeb"]';
            var result = getStyles({ selector: selector }, styleSheets);
            expect(result).not.toBeNull();
            expect(result.length).toBe($(selector).length);
        });
    });
});
