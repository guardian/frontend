define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-idle',
    'common/modules/commercial/create-ad-slot',
    'common/modules/user-prefs',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    qwery,
    Promise,
    $,
    config,
    detect,
    idleFastdom,
    createAdSlot,
    userPrefs,
    commercialFeatures
) {
    var maxAdsToShow = config.page.showMpuInAllContainers ? 999 : 3;
    var containerSelector = '.fc-container';
    var sliceSelector = '.js-fc-slice-mpu-candidate';

    return {
        init: init
    };

    function init() {
        if (!commercialFeatures.sliceAdverts) {
            return false;
        }

        var container, containerId, adSlice, isFrontFirst, fabricAdSlot,
        // get all the containers
            containers   = qwery(containerSelector),
            index        = 0,
            adSlices     = [],
            containerGap = 1,
            prefs        = userPrefs.get('container-states'),
            isNetworkFront = ['uk', 'us', 'au'].indexOf(config.page.pageId) !== -1,
            addFabricAd  = (config.page.isFront && config.switches.fabricAdverts && detect.isBreakpoint({max : 'phablet'}));

        // insert fabric advert at first container in lieu of a top slot
        if (addFabricAd) {
            fabricAdSlot = bonzo(createAdSlot('fabric', 'container-inline'));
            fabricAdSlot.addClass('ad-slot--mobile');
            fabricAdSlot.insertAfter(containers[0]);
        }

        // skip the initial containers if we've already added an advert to the first
        index+= addFabricAd ? (1 + containerGap) : 0;

        // pull out ad slices which have at least x containers between them
        while (index < containers.length) {
            container    = containers[index];
            containerId  = container.getAttribute('data-id');
            adSlice      = container.querySelector(sliceSelector);
            // don't display ad in the first container on the network fronts
            isFrontFirst = isNetworkFront && index === 0;

            if (config.page.showMpuInAllContainers) {
                adSlices.push(adSlice);
                index++;
            } else {
                if (adSlice && !isFrontFirst && (!prefs || prefs[containerId] !== 'closed')) {
                    adSlices.push(adSlice);
                    index += (containerGap + 1);
                } else {
                    index++;
                }
            }
        }

        return Promise.all(adSlices.slice(0, maxAdsToShow).map(function (adSlice, index) {
                // When we are inside the AB test we are adding inline1 manually so index needs to start from 2.
                var inlineIndexOffset = (config.tests.cmTopBannerPosition) ? 2 : 1;

                var adName        = 'inline' + (index + inlineIndexOffset),
                    adSlot        = createAdSlot(adName, 'container-inline');

                adSlot.className += ' ' + (detect.getBreakpoint() === 'mobile' ? 'ad-slot--mobile' : 'container-inline');

                return new Promise(function (resolve) {
                    idleFastdom.write(function () {
                        // add a tablet+ ad to the slice
                        if (detect.getBreakpoint() !== 'mobile') {
                            bonzo(adSlice)
                                .removeClass('fc-slice__item--no-mpu')
                                .append(adSlot);
                        } else {
                            // add a mobile advert after the container
                            bonzo(adSlot)
                                .insertAfter($.ancestor(adSlice, 'fc-container'));
                        }

                        resolve(null);
                    });
                });
            })
        );
    }

});
