define([
    'common/utils/config',
    'common/modules/ui/sticky',
    'common/utils/fastdom-promise'
], function (
    config,
    Sticky,
    fastdom
) {

    var mpuHeight = 275;

    function stickyMpu($adSlot) {
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
                $adSlot.parent().css('height', (articleBodyOffset + mpuHeight) + 'px');
            }).then(function () {
                return new Sticky($adSlot[0]).init();
            });
        });
    }

    return stickyMpu;

});
