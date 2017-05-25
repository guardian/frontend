// @flow
import { initABTests } from 'admin/bootstraps/abtests';
import { initRadiator } from 'admin/bootstraps/radiator';
import commercialBrowserPerformance
    from 'admin/bootstraps/commercial-browser-performance';
import domReady from 'domready';

domReady(() => {
    switch (window.location.pathname) {
        case '/analytics/abtests':
            initABTests();
            break;

        case '/radiator':
            initRadiator();
            break;

        case '/commercial/performance/browser-dashboard':
            commercialBrowserPerformance.init();
            break;

        default: // do nothing
    }
});
