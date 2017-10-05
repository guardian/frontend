// @flow
import mediator from 'lib/mediator';
import { session } from 'lib/storage';
import { google } from 'common/modules/analytics/google';
import { catchErrorsWithContext } from 'lib/robust';

const NG_STORAGE_KEY = 'gu.analytics.referrerVars';
let loc = document.location;

type Spec = {
    validTarget: Boolean,
    target: Any,
    sameHost: Boolean,
    samePage: Boolean,
    tag: string,
};

//

const isSponsorLogoLinkClick = target => target.hasAttribute('data-sponsor');

// used where we don't have an element to pass as a tag, eg. keyboard interaction
const trackNonClickInteraction = actionName => {
    google.trackNonClickInteraction(actionName);
};

const trackSamePageLinkClick = (spec: Spec) => {
    // Do not perform a same-page track link when there isn't a tag.
    if (spec.tag) {
        google.trackSamePageLinkClick(spec.target, spec.tag);
    }
};

const trackInternalLinkClick = (spec: Spec) => {
    // Store in session storage.
    // GA and Omniture will both pick it up on next page load,
    // then Omniture will remove it from storage.
    const storeObj = {
        path: loc.pathname,
        tag: spec.tag || 'untracked',
        time: new Date().getTime(),
    };
    session.set(NG_STORAGE_KEY, storeObj);
};

const trackExternalLinkClick = (spec: Spec) => {
    // Execute the GA and Omniture tracking in parallel
    // and rely on Omniture to provide a 500 ms delay so they both get a chance to complete.
    // TODO when Omniture goes away, implement the delay ourselves.
    google.trackExternalLinkClick(spec.target, spec.tag);
};

const trackClick = (spec: Spec) => {
    if (!spec.validTarget) {
        return;
    }

    if (isSponsorLogoLinkClick(spec.target)) {
        return google.trackSponsorLogoLinkClick(spec.target);
    }

    if (spec.sameHost) {
        if (spec.samePage) {
            trackSamePageLinkClick(spec);
        } else {
            trackInternalLinkClick(spec);
        }
    } else {
        trackExternalLinkClick(spec);
    }
};

const addHandlers = () => {
    mediator.on('module:clickstream:interaction', trackNonClickInteraction);

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
    mediator.emit('analytics:ready');
};

export default {
    init,
    trackClick,
    trackNonClickInteraction,
};
