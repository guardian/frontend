define([
    'bonzo',
    'qwery',
    'lodash/collections/contains',
    'lodash/functions/once',
    'lodash/objects/defaults',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/template',
    'common/modules/commercial/dfp',
    'common/modules/userPrefs'
], function (
    bonzo,
    qwery,
    contains,
    once,
    defaults,
    $,
    _,
    config,
    template,
    dfp,
    userPrefs
) {

    var adNames = ['inline1', 'inline2'],
        init = function (options) {

            if (!config.switches.standardAdverts) {
                return false;
            }

            var container, containerId, $adSlice, isFrontFirst,
                opts = defaults(
                    options || {},
                    {
                        containerSelector: '.container',
                        sliceSelector: '.js-facia-slice-mpu-candidate'
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
                container    = containers[index],
                containerId  = bonzo(container).data('id'),
                $adSlice     = $(opts.sliceSelector, container),
                // don't display ad in the first container on the fronts
                isFrontFirst = contains(['uk', 'us', 'au'], config.page.pageId) && index === 0;

                if ($adSlice.length && !isFrontFirst && (!prefs || prefs[containerId] !== 'closed')) {
                    adSlices.push($adSlice.first());
                    index += (containerGap + 1);
                } else {
                    index++;
                }
            }

            _(adSlices)
                .slice(0, adNames.length)
                .forEach(function ($adSlice, index) {
                    var adName = adNames[index],
                        $adSlot = bonzo(dfp.createAdSlot(adName, 'container-inline'));
                    $adSlice
                        .removeClass('facia-slice__item--no-mpu')
                        .append($adSlot);
                })
                .valueOf();

            return adSlices;
        };

    return {

        init: once(init)

    };

});
