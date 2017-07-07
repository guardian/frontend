define([
    'lib/config',
    'lib/mediator',
    'lib/fastdom-promise',
    'common/modules/ui/sticky',
    'commercial/modules/messenger'
], function (
    config,
    mediator,
    fastdom,
    sticky,
    messenger
) {
    var noSticky = document.documentElement.classList.contains('has-no-sticky');
    var stickyElement;
    var rightSlot;

    function stickyMpu(adSlot) {
        if (adSlot.getAttribute('data-name') !== 'right') {
            return;
        }

        rightSlot = adSlot;

        var referenceElement = document.querySelector(config.page.hasShowcaseMainElement ? '.media-primary' : '.content__article-body,.js-liveblog-body-content');
        if (!referenceElement) {
            return;
        }

        fastdom.read(function () {
            return (referenceElement[config.page.hasShowcaseMainElement ? 'offsetHeight' : 'offsetTop']) + adSlot.offsetHeight;
        }).then(function (newHeight) {
            return fastdom.write(function () {
                adSlot.parentNode.style.height = newHeight + 'px';
            });
        }).then(function () {
            if (noSticky) {
                //if there is a sticky 'paid by' band move the sticky mpu down so it will be always visible
                var options = config.page.isPaidContent ? {top: 43} : {};
                stickyElement = new sticky.Sticky(adSlot, options);
                stickyElement.init();
                messenger.register('resize', onResize);
            }
            mediator.emit('page:commercial:sticky-mpu');
        });
    }

    function onResize(specs, _, iframe) {
        if (rightSlot.contains(iframe)) {
            messenger.unregister('resize', onResize);
            stickyElement.updatePosition();
        }
    }

    stickyMpu.whenRendered = new Promise(function (resolve) {
        mediator.on('page:commercial:sticky-mpu', resolve);
    });

    return stickyMpu;

});
