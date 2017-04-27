define([
    'admin/bootstraps/abtests',
    'admin/bootstraps/radiator',
    'admin/bootstraps/commercial-browser-performance',
    'domready'
], function (
    abTests,
    radiator,
    commercialBrowserPerformance,
    domReady
) {
    domReady(function () {
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
