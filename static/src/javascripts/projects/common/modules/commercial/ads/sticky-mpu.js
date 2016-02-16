define([
    'common/utils/config',
    'common/modules/ui/sticky',
    'common/utils/fastdom-promise',
    'lodash/objects/defaults'
], function (
    config,
    Sticky,
    fastdom,
    defaults
) {

    var MPU_HEIGHT = 275;

    function StickyMpu($adSlot) {
        if ($adSlot.data('name') !== 'right') {
            return;
        }

        var referenceElement = document.querySelector(config.page.hasShowcaseMainElement ? '.media-primary' : '.content__article-body');
        if (!referenceElement) {
            return;
        }

        return fastdom.read(function () {
            return referenceElement[config.page.hasShowcaseMainElement ? 'offsetHeight' : 'offsetTop'];
        }).then(function (articleBodyOffset) {
            return fastdom.write(function () {
                $adSlot.parent().css('height', (articleBodyOffset + MPU_HEIGHT) + 'px');
            }).then(function () {
                return new Sticky($adSlot[0]).init();
            });
        });
    }

    return StickyMpu;

});
