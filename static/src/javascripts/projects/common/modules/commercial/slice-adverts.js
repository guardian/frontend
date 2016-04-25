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
    'common/modules/commercial/commercial-features',
    'lodash/objects/defaults',
    'lodash/collections/contains',
    'lodash/collections/map',
    'common/utils/chain'
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
    commercialFeatures,
    defaults,
    contains,
    map,
    chain
) {
    var maxAdsToShow = config.page.showMpuInAllContainers ? 999 : 3,
        init = function (options) {
            if (!commercialFeatures.sliceAdverts) {
                return false;
            }

            var container, containerId, $adSlice, isFrontFirst,
                opts = defaults(
                    options || {},
                    {
                        containerSelector: '.fc-container',
                        sliceSelector: '.js-fc-slice-mpu-candidate'
                    }
                ),
                // get all the containers
                containers   = qwery(opts.containerSelector),
                index        = 0,
                adSlices     = [],
                containerGap = 1,
                prefs        = userPrefs.get('container-states');

            // pull out ad slices which have at least x containers between them
            while (index < containers.length) {
                container    = containers[index];
                containerId  = bonzo(container).data('id');
                $adSlice     = $(opts.sliceSelector, container);
                // don't display ad in the first container on the fronts
                isFrontFirst = contains(['uk', 'us', 'au'], config.page.pageId) && index === 0;

                if (config.page.showMpuInAllContainers) {
                    adSlices.push($adSlice.first());
                    index++;
                } else {
                    if ($adSlice.length && !isFrontFirst && (!prefs || prefs[containerId] !== 'closed')) {
                        adSlices.push($adSlice.first());
                        index += (containerGap + 1);
                    } else {
                        index++;
                    }
                }
            }

            return Promise.all(chain(adSlices).slice(0, maxAdsToShow).and(map, function ($adSlice, index) {
                    // When we are inside the AB test we are adding inline1 manually so index needs to start from 2.
                    var inlineIndexOffset = (config.tests.cmTopBannerPosition) ? 2 : 1;

                    var adName        = 'inline' + (index + inlineIndexOffset),
                        $mobileAdSlot = bonzo(createAdSlot(adName, 'container-inline'))
                            .addClass('ad-slot--mobile'),
                        $tabletAdSlot = bonzo(createAdSlot(adName, 'container-inline'))
                            .addClass('ad-slot--not-mobile');

                    return new Promise(function (resolve) {
                        idleFastdom.write(function () {
                            // add a tablet+ ad to the slice
                            if (detect.getBreakpoint() !== 'mobile') {
                                $adSlice
                                    .removeClass('fc-slice__item--no-mpu')
                                    .append($tabletAdSlot);
                            } else {
                                // add a mobile advert after the container
                                $mobileAdSlot
                                    .insertAfter($.ancestor($adSlice[0], 'fc-container'));
                            }

                            resolve(null);
                        });
                    });
                }).valueOf()
            ).then(function () {
                return adSlices;
            });
        };

    return {
        init: init
    };
});
