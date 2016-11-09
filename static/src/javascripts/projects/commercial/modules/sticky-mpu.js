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
    var rightSlotId = 'dfp-ad--right';

    function stickyMpu($adSlot) {
        if ($adSlot.data('name') !== 'right' || stickyElement) {
            return;
        }

        var referenceElement = document.querySelector(config.page.hasShowcaseMainElement ? '.media-primary' : '.content__article-body');
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
            messenger.register('set-ad-height', onAppNexusResize);
            return stickyElement;
        });
    }

    function onAppNexusResize(specs, _, iframe) {
        var adSlot = closest(iframe, '.js-ad-slot');
        if (adSlot.id === rightSlotId) {
            messenger.unregister('set-ad-height', onAppNexusResize);
            fastdom.write(function () {
                iframe.style.height = specs.height + 'px';
                stickyElement.updatePosition();
            });
        }
    }

    return stickyMpu;

});
