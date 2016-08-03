define([
    'bonzo',
    'qwery',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/user-prefs',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    qwery,
    config,
    detect,
    fastdom,
    createSlot,
    userPrefs,
    commercialFeatures
) {
    var maxAdsToShow = 3;
    var containerSelector = '.fc-container';
    var sliceSelector = '.js-fc-slice-mpu-candidate';
    var containerGap = 1;

    return {
        init: init
    };

    function init() {
        if (!commercialFeatures.sliceAdverts) {
            return Promise.resolve(false);
        }

        var adSlots;
        var prefs               = userPrefs.get('container-states') || {};
        var isMobile            = detect.getBreakpoint() === 'mobile';
        var isNetworkFront      = ['uk', 'us', 'au'].indexOf(config.page.pageId) !== -1;
        // The server-rendered top slot is above nav. For mobile, we remove that server-rendered top slot,
        // and substitute it with a slot that accepts both ordinary MPUs and the 'fabric' ads (88x71s) that take the
        // top slot in responsive takeovers. Beware, this substitute slot is still called 'top-above-nav'.
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
            // filter out any container candidates where:
            // - the container is closed (collapsed) through user preferences, or
            // - the container is first on a network front, or
            // - the container does not contain an adslice candidate, or
            // - the minimum number of containers (check the containerGap) from the last viable advert container has not been satisfied.
            .filter(function (item, index) {

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
                var adName = replaceTopSlot ?
                    'inline' + index :
                    'inline' + (index + 1);
                var classNames = ['container-inline'];
                var adSlot;

                if (config.page.isAdvertisementFeature) {
                    classNames.push('adfeature');
                }

                if (isMobile) {
                    className.push('mobile');
                }

                adSlot = replaceTopSlot && index === 0 ?
                    createSlot('top-above-nav', classNames) :
                    createSlot(adName, classNames);

                return {
                    anchor: isMobile ? item.container : item.adSlice,
                    adSlot: adSlot
                };
            });

        return fastdom.write(function () {
            adSlots.forEach(isMobile ? insertOnMobile : insertOnTabletPlus);

            function insertOnMobile(item) {
                // add a mobile advert after the container
                item.anchor.lastElementChild.appendChild(item.adSlot);
            }

            function insertOnTabletPlus(item) {
                // add a tablet+ ad to the slice
                bonzo(item.anchor).removeClass('fc-slice__item--no-mpu');
                item.anchor.appendChild(item.adSlot);
            }
        });

    }

});
