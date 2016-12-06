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

        var containerSelector = '.js-gallery-slot';
        var adContainers;
        var isMobile = detect.getBreakpoint() === 'mobile';
        var getSlotName = isMobile ? getSlotNameForMobile : getSlotNameForDesktop;
        var classNames = ['gallery-inline', 'dark'];

        if (isMobile) {
            classNames.push('mobile');
        }

        adContainers = qwery(containerSelector)

        .map(function (item, index) {
            var adSlot = createSlot(getSlotName(index), classNames);

            return {
                anchor: item,
                adSlot: adSlot
            };
        });

        if (adContainers.length < 1) {
            return Promise.resolve(false);
        }

        return fastdom.write(function () {

            adContainers.forEach(insertSlot);

            function insertSlot(item) {
                item.anchor.appendChild(item.adSlot);
            }

        });

    }

    function getSlotNameForMobile(index) {
        return index === 0 ? 'top-above-nav' : 'inline' + index;
    }

    function getSlotNameForDesktop(index) {
        return 'inline' + (index + 1);
    }
});
