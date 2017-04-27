import abTests from 'admin/bootstraps/abtests';
import radiator from 'admin/bootstraps/radiator';
import commercialBrowserPerformance from 'admin/bootstraps/commercial-browser-performance';
import domReady from 'domready';
domReady(function() {
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
