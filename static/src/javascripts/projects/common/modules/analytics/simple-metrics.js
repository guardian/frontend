define([
    'common/utils/mediator',
    'common/modules/analytics/beacon'
], function (
    mediator,
    beacon
) {

    // Simple metrics that only target browsers that support sendBeacon

    return {
        init: function () {
            if (navigator.sendBeacon) {
                // sm = simple metrics
                beacon.beaconCounts('sm-page-view');

                mediator.on('module:clickstream:click', function (spec) {

                    var clickData = [];

                    if (spec.samePage) {
                        // people who clicked something but will stay on this page
                        clickData.push('sm-interaction-on-same-page');
                    } else if (spec.sameHost) {
                        // people who will view another Guardian page
                        clickData.push('sm-another-guardian-page');
                    }

                    // people who clicked on the related content component
                    if (/related-content/.test(spec.tag)) {
                        clickData.push('sm-clicked-related-content');
                    }

                    // people who clicked on the "more from this series" component
                    if (/\| series \|/.test(spec.tag)) {
                        clickData.push('sm-clicked-series-component');
                    }

                    // people who clicked on the bottom "most popular" component (righthand popular not included)
                    if (/\| most popular \|/.test(spec.tag)) {
                        clickData.push('sm-clicked-most-popular-component');
                    }

                    if (clickData.length > 0) {
                        beacon.beaconCounts(clickData);
                    }

                });
            }
        }
    };
});
