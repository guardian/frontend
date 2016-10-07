define([
    'admin/bootstraps/abtests',
    'admin/bootstraps/radiator',
    'admin/bootstraps/commercial-browser-performance',
    'admin/bootstraps/commercial-programmatic-performance',
    'domReady'
], function (
    abTests,
    radiator,
    commercialBrowserPerformance,
    commercialProgrammaticPerformance,
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

            case '/commercial/performance/programmatic-dashboard':
                commercialProgrammaticPerformance.init();
                break;
        }
    });
});
