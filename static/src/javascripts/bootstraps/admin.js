// @flow
import { initABTests } from 'admin/bootstraps/abtests';
import { initRadiator } from 'admin/bootstraps/radiator';
import domReady from 'domready';

domReady(() => {
    switch (window.location.pathname) {
        case '/analytics/abtests':
            initABTests();
            break;

        case '/radiator':
            initRadiator();
            break;

        default: // do nothing
    }
});
