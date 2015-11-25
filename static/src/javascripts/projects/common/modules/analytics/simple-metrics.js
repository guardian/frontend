define([
    'common/utils/filterPairs',
    'common/utils/mediator',
    'common/modules/analytics/beacon'
], function (
    filterPairs,
    mediator,
    beacon
) {
    // Simple metrics that only target browsers that support sendBeacon
    return function () {
        if (navigator.sendBeacon) {
            // sm = simple metrics
            beacon.beaconCounts('sm-page-view');

            mediator.on('module:clickstream:click', function (spec) {
                var clickData = filterPairs([
                    // people who clicked something but will stay on this page
                    ['sm-interaction-on-same-page', spec.samePage],
                    // people who will view another Guardian page
                    ['sm-another-guardian-page', !spec.samePage && spec.sameHost],
                    // people who clicked on the related content component
                    ['sm-clicked-related-content', /related-content/.test(spec.tag)],
                    // people who clicked on the "more from this series" component
                    ['sm-clicked-series-component', /\| series \|/.test(spec.tag)],
                    // people who clicked on the bottom "most popular" component (righthand popular not included)
                    ['sm-clicked-most-popular-component', /\| most popular \|/.test(spec.tag)]
                ]);

                if (clickData.length > 0) {
                    beacon.beaconCounts(clickData);
                }
            });
        }
    };
});
