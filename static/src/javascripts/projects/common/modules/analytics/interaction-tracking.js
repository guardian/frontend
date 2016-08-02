define([
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/analytics/google',
    'common/modules/analytics/omniture',
    'common/utils/robust'
], function (
    mediator,
    storage,
    google,
    omniture,
    robust
) {
    var NG_STORAGE_KEY = 'gu.analytics.referrerVars';

    function addHandlers() {
        mediator.on('module:clickstream:interaction', trackNonClickInteraction);

        mediator.on('module:clickstream:click', function (spec) {
            // We don't want tracking errors to terminate the event emitter, as
            // this will mean other event listeners will not be called.
            robust.catchErrorsAndLog('c-analytics', function () { trackClick(spec); });
        });
    }

    function trackClick(spec) {
        if (!spec.validTarget) {
            return;
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
    }

    // used where we don't have an element to pass as a tag, eg. keyboard interaction
    function trackNonClickInteraction(actionName) {
        google.trackNonClickInteraction(actionName);
        omniture.trackLinkImmediate(actionName);
    }

    function trackSamePageLinkClick(spec) {
        // Do not perform a same-page track link when there isn't a tag.
        if (spec.tag) {
            google.trackSamePageLinkClick(spec.target, spec.tag);
            omniture.trackSamePageLinkClick(spec.target, spec.tag, {customEventProperties: spec.customEventProperties});
        }
    }

    function trackInternalLinkClick(spec) {
        // Store in session storage.
        // GA and Omniture will both pick it up on next page load,
        // then Omniture will remove it from storage.
        var storeObj = {
            pageName: this.s.pageName,
            tag: spec.tag || 'untracked',
            time: new Date().getTime()
        };
        storage.session.set(NG_STORAGE_KEY, storeObj);
    }

    function trackExternalLinkClick(spec) {
        // Execute the GA and Omniture tracking in parallel
        // and rely on Omniture to provide a 500 ms delay so they both get a chance to complete.
        // TODO when Omniture goes away, implement the delay ourselves.
        google.trackExternalLinkClick(spec.target, spec.tag);
        omniture.trackExternalLinkClick(spec.target, spec.tag, {customEventProperties: spec.customEventProperties});
    }

    function init() {
        omniture.go();
        addHandlers();
        mediator.emit('analytics:ready');
    }

    return {
        init: init,
        trackClick: trackClick,
        trackNonClickInteraction: trackNonClickInteraction
    };
});
