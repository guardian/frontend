define([
    'bonzo',
    'fastdom',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/modules/commercial/create-ad-slot',
    'common/modules/user-prefs'
], function (
    bonzo,
    fastdom,
    qwery,
    Promise,
    $,
    _,
    config,
    createAdSlot,
    userPrefs
) {
    var adNames = ['inline1', 'inline2', 'inline3'],
        init = function (options) {
            if (!config.switches.standardAdverts) {
                return false;
            }

            var container, containerId, $adSlice, isFrontFirst,
                opts = _.defaults(
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

            // pull out ad slices which are have at least x containers between them
            while (index < containers.length) {
                container    = containers[index];
                containerId  = bonzo(container).data('id');
                $adSlice     = $(opts.sliceSelector, container);
                // don't display ad in the first container on the fronts
                isFrontFirst = _.contains(['uk', 'us', 'au'], config.page.pageId) && index === 0;

                if ($adSlice.length && !isFrontFirst && (!prefs || prefs[containerId] !== 'closed') && !config.page.omitMPUs) {
                    adSlices.push($adSlice.first());
                    index += (containerGap + 1);
                } else {
                    index++;
                }
            }

            return Promise.all(_(adSlices)
                .slice(0, adNames.length)
                .map(function ($adSlice, index) {
                    var adName        = adNames[index],
                        $mobileAdSlot = bonzo(createAdSlot(adName, 'container-inline'))
                            .addClass('ad-slot--mobile'),
                        $tabletAdSlot = bonzo(createAdSlot(adName, 'container-inline'))
                            .addClass('ad-slot--not-mobile');

                    return new Promise(function (resolve) {
                        fastdom.write(function () {
                            // add a tablet+ ad to the slice
                            $adSlice
                                .removeClass('fc-slice__item--no-mpu')
                                .append($tabletAdSlot);
                            // add a mobile advert after the container
                            $mobileAdSlot
                                .insertAfter($.ancestor($adSlice[0], 'fc-container'));

                            resolve(null);
                        });
                    });
                })
                .valueOf()
            ).then(function () {
                return adSlices;
            });
        };

    return {
        init: init
    };
});
