define([
    'bonzo',
    'qwery',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'common/modules/commercial/track-ad',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/dfp/dfp-api',
    'common/modules/user-prefs',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    qwery,
    config,
    detect,
    fastdom,
    trackAd,
    createAdSlot,
    dfp,
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

        var fabricAdSlot, adSlots;
        var prefs          = userPrefs.get('container-states') || {};
        var isMobile       = detect.getBreakpoint() === 'mobile';
        var isNetworkFront = ['uk', 'us', 'au'].indexOf(config.page.pageId) !== -1;
        var hasFabricAd    = (config.page.isFront && config.switches.fabricAdverts && detect.isBreakpoint({max : 'phablet'}));

        adSlots = qwery(containerSelector)
            // get all ad slices
            .map(function (container) {
                return {
                    container: container,
                    adSlice: container.querySelector(sliceSelector)
                };
            })
            // pull out ad slices which have at least x containers between them
            .filter(function (item, index) {
                if (config.page.showMpuInAllContainers) {
                    return true;
                }

                // Slots are inserted every containerGap + 1 slice
                if (!item.adSlice || index % (containerGap + 1) !== 0) {
                    return false;
                }

                var containerId  = item.container.getAttribute('data-id');
                var isContainerClosed = prefs[containerId] === 'closed';
                var isFrontFirst = isNetworkFront && index === 0;
                return !(isFrontFirst || isContainerClosed);
            })
            // limit to maxAdsToShow
            .slice(0, maxAdsToShow)
            // create ad slots for the selected slices
            .map(function (item, index) {
                // When we are inside the AB test we are adding inline1 manually so index needs to start from 2.
                var inlineIndexOffset = (config.tests.cmTopBannerPosition) ? 2 : 1;
                var adName = 'inline' + (index + inlineIndexOffset);
                var adSlot = hasFabricAd && index === 0 ?
                    (fabricAdSlot = createAdSlot('fabric', 'container-inline')) :
                    createAdSlot(adName, 'container-inline');

                adSlot.className += ' ' + (isMobile ? 'ad-slot--mobile' : 'container-inline');

                return {
                    anchor: isMobile ? item.container : item.adSlice,
                    adSlot: adSlot
                };
            });

        if (hasFabricAd) {
            // if there is no fabric creative, we fall back to loading
            // a normal MPU instead
            trackAd('dfp-ad--fabric').then(function (isLoaded) {
                if (!isLoaded) {
                    var adSlot = createAdSlot(adName, 'container-inline');
                    adSlot.className += ' ad-slot--mobile';
                    fastdom.write(function () {
                        fabricAdSlot.parentNode.replaceChild(adSlot, fabricAdSlot);
                        dfp.addSlot(adSlot);
                    });
                }
            });
        }

        return fastdom.write(function () {
            adSlots.forEach(isMobile ? insertOnMobile : insertOnTabletPlus);
        });

        function insertOnMobile(item, index) {
            // add a mobile advert after the container
            item.anchor.parentNode.insertBefore(item.adSlot, item.anchor.nextSibling);
        }

        function insertOnTabletPlus(item, index) {
            // add a tablet+ ad to the slice
            bonzo(item.anchor).removeClass('fc-slice__item--no-mpu');
            item.anchor.appendChild(item.adSlot);
        }
    }

});
