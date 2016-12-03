define([
    'common/utils/config',
    'common/utils/closest',
    'common/utils/fastdom-promise',
    'common/modules/ui/sticky',
    'commercial/modules/messenger'
], function (
    config,
    closest,
    fastdom,
    Sticky,
    messenger
) {
    var stickyElement = null;
    var rightSlot;

    function stickyMpu($adSlot) {
        if ($adSlot.data('name') !== 'right' || stickyElement) {
            return;
        }

        rightSlot = $adSlot[0];

        var referenceElement = document.querySelector(config.page.hasShowcaseMainElement ? '.media-primary' : '.content__article-body,.js-liveblog-body-content');
        if (!referenceElement) {
            return;
        }

        return fastdom.read(function () {
            return (referenceElement[config.page.hasShowcaseMainElement ? 'offsetHeight' : 'offsetTop']) + $adSlot[0].offsetHeight;
        }).then(function (newHeight) {
            return fastdom.write(function () {
                $adSlot.parent().css('height', newHeight + 'px');
            });
        }).then(function () {
            //if there is a sticky 'paid by' band move the sticky mpu down so it will be always visible
            var options = config.page.isAdvertisementFeature ? {top: 43} : {};
            stickyElement = new Sticky($adSlot[0], options);
            stickyElement.init();
            messenger.register('resize', onResize);
            return stickyElement;
        });
    }

    function onResize(specs, _, iframe) {
        if (rightSlot.contains(iframe)) {
            messenger.unregister('resize', onResize);
            stickyElement.updatePosition();
        }
    }

    return stickyMpu;

});
