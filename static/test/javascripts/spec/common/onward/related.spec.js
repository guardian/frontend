define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    qwery,
    $,
    fixtures,
    Injector
) {
    describe('Related', function () {

        var expandableSpy = sinon.spy(function () {
            return {
                init: function () {}
            };
        });

        var fixturesConfig = {
            id: 'related',
            fixtures: [
                '<div class="js-related"></div>',
                '<div class="related-trails"></div>'
            ]
        },
        $fixturesContainer,
        injector = new Injector(),
        Related, config;

        beforeEach(function (done) {

            injector.mock('common/modules/ui/expandable', expandableSpy);
            injector.require(['common/modules/onward/related', 'common/utils/config'], function () {
                Related = arguments[0];
                config = arguments[1];

                config.page = {
                    hasStoryPackage: false,
                    showRelatedContent: true
                };
                config.switches = {
                    relatedContent: true,
                    ajaxRelatedContent: true
                };
                fixtures.render(fixturesConfig);

                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(Related).toBeDefined();
        });

        it('should hide if there\'s no story package and related can\'t be fetched', function () {
            config.switches.relatedContent = false;

            var related = new Related();
            related.renderRelatedComponent();
            expect($('.js-related', $fixturesContainer).hasClass('u-h')).toBe(true);
        });

        it('should create expandable if page has story package', function () {
            config.page.hasStoryPackage = true;

            var related = new Related();
            related.renderRelatedComponent();
            expect(expandableSpy).toHaveBeenCalledWith({
                dom:       qwery('.related-trails', $fixturesContainer)[0],
                expanded:  false,
                showCount: false
            });
        });

    });
});
