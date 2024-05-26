import { mediator } from 'lib/mediator';
import { storage } from '@guardian/libs';
import { catchErrorsWithContext } from 'lib/robust';

const NG_STORAGE_KEY = 'gu.analytics.referrerVars';
let loc = document.location;

const trackInternalLinkClick = (spec) => {
    // Store in session storage.
    // GA and Omniture will both pick it up on next page load,
    // then Omniture will remove it from storage.
    const storeObj = {
        path: loc.pathname,
        tag: spec.tag || 'untracked',
        time: new Date().getTime(),
    };
    storage.session.set(NG_STORAGE_KEY, storeObj);
};

const trackClick = (spec) => {
    if (!spec.validTarget) {
        return;
    }

    if (spec.sameHost) {
        trackInternalLinkClick(spec);
    }
};

const addHandlers = () => {
    mediator.on('module:clickstream:click', spec => {
        // We don't want tracking errors to terminate the event emitter, as
        // this will mean other event listeners will not be called.
        catchErrorsWithContext([
            [
                'c-analytics',
                () => {
                    trackClick(spec);
                },
            ],
        ]);
    });
};

const init = (options = {}) => {
    if (options.location) {
        loc = options.location; // allow a fake location to be passed in for testing
    }
    addHandlers();
};

export default {
    init,
    trackClick,
};
