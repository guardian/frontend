define([
    'qwery',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features'
], function (
    qwery,
    detect,
    fastdom,
    createSlot,
    commercialFeatures
) {

    return {
        init: init
    };

    function init() {

        if (!commercialFeatures.galleryAdverts) {
            return Promise.resolve(false);
        }

        var containerSelector = '.js-gallery-slot"';
        var adContainers;
        var isMobile = detect.getBreakpoint() === 'mobile';
        var classNames = ['gallery-inline', 'dark'];

        if (isMobile) {
            classNames.push('mobile');
        }

        adContainers = qwery(containerSelector)

        .map(function (item, index) {
            var adSlot;

            if (isMobile && index == 0) {
                adSlot = createSlot('top-above-nav', classNames);
            }
            else if (isMobile && index == 1) {
                adSlot = createSlot('inline' + (index), classNames);
            }
            else if (!isMobile) {
                adSlot = createSlot('inline' + (index+1), classNames);
            }

            return {
                anchor: item,
                adSlot: adSlot
            };
        });

        if (adContainers.length < 1) {
            return;
        }

        return fastdom.write(function () {

            adContainers.forEach(insertSlot);

        function insertSlot(item) {
            item.anchor.appendChild(item.adSlot);
        }

    });

    }
});
