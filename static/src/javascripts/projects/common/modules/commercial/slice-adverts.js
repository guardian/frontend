define([
    'bonzo',
    'qwery',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'common/modules/commercial/create-ad-slot',
    'common/modules/user-prefs',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    qwery,
    config,
    detect,
    fastdom,
    createAdSlot,
    userPrefs,
    commercialFeatures
) {
    var maxAdsToShow = config.page.showMpuInAllContainers ? 999 : 3;
    var containerSelector = '.fc-container';
    var sliceSelector = '.js-fc-slice-mpu-candidate';
    var containerGap = 1;

    return {
        init: init
    };

    function init() {
        if (!commercialFeatures.sliceAdverts) {
            return false;
        }

        var adSlots;
        var prefs               = userPrefs.get('container-states') || {};
        var isMobile            = detect.getBreakpoint() === 'mobile';
        var isNetworkFront      = ['uk', 'us', 'au'].indexOf(config.page.pageId) !== -1;
        // Mobile doesn't have a top slot, so we substitute a slot that accepts both ordinary MPUs and the 'fabric' ads (88x71s)
        // that take the top slot in responsive takeovers.
        var replaceTopSlot      = (config.page.isFront && detect.isBreakpoint({max : 'phablet'}));
        // We must keep a small bit of state in the filtering logic
        var lastIndex           = -1;

        adSlots = qwery(containerSelector)
            // get all ad slices
            .map(function (container) {
                return {
                    container: container,
                    adSlice: container.querySelector(sliceSelector)
                };
            })
            // pull out closed, empty (no slice) or first on front containers,
            // keeping containers only if they are $containerGap nodes apart
            .filter(function (item, index) {
                if (config.page.showMpuInAllContainers) {
                    return true;
                }

                var isThrasher = bonzo(item.container).hasClass('fc-container--thrasher');
                if (replaceTopSlot && index === 0 && !isThrasher) {
                    // it's mobile, so we needn't check for an adSlice
                    lastIndex = index;
                    return true;
                }

                var containerId  = item.container.getAttribute('data-id');
                var isContainerClosed = prefs[containerId] === 'closed';
                var isFrontFirst = isNetworkFront && index === 0;
                var isFarEnough = lastIndex === -1 || index - lastIndex > containerGap;
                if (!item.adSlice || isFrontFirst || isContainerClosed || !isFarEnough) {
                    return false;
                }

                lastIndex = index;

                return true;
            })
            // limit to maxAdsToShow
            .slice(0, maxAdsToShow)
            // create ad slots for the selected slices
            .map(function (item, index) {
                var adName = 'inline' + (index + 1);
                var adSlot = createAdSlot(adName, 'container-inline');

                adSlot.className += ' ' + (isMobile ? 'ad-slot--mobile' : 'container-inline');

                return {
                    anchor: isMobile ? item.container : item.adSlice,
                    adSlot: adSlot
                };
            });

        return fastdom.write(function () {
            adSlots.forEach(isMobile ? insertOnMobile : insertOnTabletPlus);

            function insertOnMobile(item) {
                // add a mobile advert after the container
                item.anchor.parentNode.insertBefore(item.adSlot, item.anchor.nextSibling);
            }

            function insertOnTabletPlus(item) {
                // add a tablet+ ad to the slice
                bonzo(item.anchor).removeClass('fc-slice__item--no-mpu');
                item.anchor.appendChild(item.adSlot);
            }
        });

    }

});
