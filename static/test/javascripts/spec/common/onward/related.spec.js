define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'jasq'
], function (
    qwery,
    $,
    fixtures
) {

    var expandableSpy;

    describe('Related', {
        moduleName: 'common/modules/onward/related',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            relatedContent:     true,
                            ajaxRelatedContent: true
                        },
                        page: {
                            hasStoryPackage:    false,
                            showRelatedContent: true
                        }
                    };
                },
                'common/modules/ui/expandable': function () {
                    return expandableSpy = sinon.spy(function () {
                        return {
                            init: function () { }
                        };
                    });
                }
            }
        },
        specify: function () {

            var fixturesConfig = {
                    id: 'related',
                    fixtures: [
                        '<div class="js-related"></div>',
                        '<div class="related-trails"></div>'
                    ]
                },
                $fixturesContainer;

            beforeEach(function () {
                fixtures.render(fixturesConfig);
            });

            afterEach(function () {
                fixtures.clean(fixturesConfig.id);
            });

            it('should exist', function (Related) {
                expect(Related).toBeDefined();
            });

            it('should hide if there\'s no story package and related can\'t be fetched', function (Related, deps) {
                deps['common/utils/config'].switches.relatedContent = false;
                var related = new Related();
                related.renderRelatedComponent();
                expect($('.js-related', $fixturesContainer).hasClass('u-h')).toBe(true);
            });

            it('should create expandable if page has story package', function (Related, deps) {
                deps['common/utils/config'].page.hasStoryPackage = true;
                var related = new Related();
                related.renderRelatedComponent();
                expect(expandableSpy).toHaveBeenCalledWith({
                    dom:       qwery('.related-trails', $fixturesContainer)[0],
                    expanded:  false,
                    showCount: false
                });
            });

        }
    });

});
