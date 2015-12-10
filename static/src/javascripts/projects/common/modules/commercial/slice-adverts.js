define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/fastdom-idle',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/dfp-api',
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
    mediator,
    detect,
    idleFastdom,
    createAdSlot,
    dfp,
    userPrefs,
    commercialFeatures,
    defaults,
    contains,
    map,
    chain) {
    var maxAdsToShow = config.page.showMpuInAllContainers ? 999 : 3,
        index,
        init = function (options) {
            if (!commercialFeatures.sliceAdverts) {
                return false;
            }

            if (commercialFeatures.popularContentMPU) {
                mediator.on('modules:geomostpopular:ready', onHeadlines);
                mediator.on('modules:onward:geo-most-popular:ready', onHeadlines);
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
                adSlices     = [],
                containerGap = 1,
                prefs        = userPrefs.get('container-states');

            index = 0;

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

            return Promise.all(chain(adSlices).slice(0, maxAdsToShow).and(map, sliceAdvertSlot).valueOf()).then(function () {
                return adSlices;
            });
        };

    function sliceAdvertSlot($adSlice, index) {
        var adName        = 'inline' + (index + 1),
            $slot         = bonzo(createAdSlot(adName, 'container-inline'));

        return new Promise(function (resolve) {
            // add a tablet+ ad to the slice
            if (detect.getBreakpoint() !== 'mobile') {
                idleFastdom.write(function () {
                    $slot.addClass('ad-slot--not-mobile');
                    $adSlice
                        .removeClass('fc-slice__item--no-mpu')
                        .append($slot);
                    resolve($slot);
                });
            } else {
                // add a mobile advert after the container
                idleFastdom.write(function () {
                    $slot.addClass('ad-slot--mobile');
                    $slot
                        .insertAfter($.ancestor($adSlice[0], 'fc-container'));
                    resolve($slot);
                });
            }
        });
    }

    function onHeadlines() {
        var $li = $('.js-popular-trails .js-fc-slice-mpu-candidate-onload').first();
        idleFastdom.write(function () {
            $li.removeClass('js-fc-slice-mpu-candidate-onload')
                .addClass('fc-slice__popular-mpu')
                .addClass('fc-slice__item--mpu-candidate');
            sliceAdvertSlot($li, index).then(function ($slot) {
                dfp.addSlot($slot);
            });
        });
        mediator.off('modules:geomostpopular:ready', onHeadlines);
        mediator.off('modules:onward:geo-most-popular:ready', onHeadlines);
    }

    return {
        init: init
    };
});
