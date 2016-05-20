define([
    'common/utils/detect',
    'common/utils/config',
    'common/modules/analytics/beacon'
], function (
    detect,
    config,
    beacon
) {

    function clearHash() {
        if (detect.hasPushStateSupport()) {
            history.replaceState('', document.title, window.location.pathname);
        } else {
            window.location.hash = '';
        }
    }

    return {
        init: function () {
            var hash = window.location.hash;

            if (window.location.pathname === '/us') {
                if (config.tests.headlinesAbVariant) {
                    beacon.counts('headlines-variant-seen');
                } else if (config.tests.headlinesAbControl) {
                    beacon.counts('headlines-control-seen');
                }
            }

            if (hash === '#headline-variant') {
                beacon.counts('headlines-variant-clicked');
                clearHash();
            } else if (hash === '#headline-control') {
                beacon.counts('headlines-control-clicked');
                clearHash();
            }
        }
    };
});
