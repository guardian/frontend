import qwery from 'qwery';
import $ from 'common/utils/$';
import fixtures from 'helpers/fixtures';
import Injector from 'helpers/injector';
import sinonjs from 'sinonjs';

var expandableSpy = {
    __useDefault: true,
    default: sinon.spy(function () {
        return {
            init: function () {}
        };
    })
};

new Injector()
    .mock('common/modules/ui/expandable', expandableSpy)
    .test(['common/modules/onward/related', 'common/utils/config'], function (Related, config) {

        var fixturesConfig = {
                id: 'related',
                fixtures: [
                    '<div class="js-related"></div>',
                    '<div class="related-trails"></div>'
                ]
            },
            $fixturesContainer;

        describe('Related', function () {

            beforeEach(function () {
                mocks.store['common/utils/config'].page = {
                    hasStoryPackage: false,
                    showRelatedContent: true
                };
                mocks.store['common/utils/config'].switches = {
                    relatedContent: true,
                    ajaxRelatedContent: true
                };
                fixtures.render(fixturesConfig);
            });

            afterEach(function () {
                fixtures.clean(fixturesConfig.id);
            });

            it('should exist', function () {
                expect(Related).toBeDefined();
            });

            it('should hide if there\'s no story package and related can\'t be fetched', function () {
                mocks.store['common/utils/config'].switches.relatedContent = false;

                var related = new Related();
                related.renderRelatedComponent();
                expect($('.js-related', $fixturesContainer).hasClass('u-h')).toBe(true);
            });

            it('should create expandable if page has story package', function () {
                mocks.store['common/utils/config'].page.hasStoryPackage = true;

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


