define([
    'common/utils/ajax',
    'admin/bootstraps/abtests',
    'admin/bootstraps/radiator',
    'admin/bootstraps/commercial-browser-performance',
    'domReady'
], function (
    ajax,
    abTests,
    radiator,
    commercialBrowserPerformance,
    domReady
) {

    domReady(function () {
        ajax.setHost('');

        switch (window.location.pathname) {
            case '/analytics/abtests':
                abTests.init();
                break;

            case '/radiator':
                radiator.init();
                break;

            case '/commercial/performance/browser-dashboard':
                commercialBrowserPerformance.init();
                break;
        }
    });
});
