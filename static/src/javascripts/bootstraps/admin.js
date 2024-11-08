import { init as initDrama } from 'admin/bootstraps/drama';
import { init as initWarnings } from 'admin/bootstraps/switchwarnings';
import { initABTests } from 'admin/bootstraps/abtests';
import domReady from 'domready';

domReady(() => {
    switch (window.location.pathname) {
        case '/analytics/abtests':
            initABTests();
            break;

        case '/dev/switchboard':
            initDrama();
            initWarnings();
            break;

        default: // do nothing
    }
});
