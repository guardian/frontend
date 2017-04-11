define([
    'lib/mediator',
    'lib/storage',
    'common/modules/analytics/google',
    'lib/robust'
], function (
    mediator,
    storage,
    google,
    robust
) {
    var NG_STORAGE_KEY = 'gu.analytics.referrerVars';
    var loc = document.location;

    function addHandlers() {
        mediator.on('module:clickstream:interaction', trackNonClickInteraction);

        mediator.on('module:clickstream:click', function (spec) {
            // We don't want tracking errors to terminate the event emitter, as
            // this will mean other event listeners will not be called.
            robust.catchErrorsWithContext([
                ['c-analytics', function () { trackClick(spec); }],
            ]);
        });
    }

    function trackClick(spec) {
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
    }

    function isSponsorLogoLinkClick(target) {
        return target.hasAttribute('data-sponsor');
    }

    // used where we don't have an element to pass as a tag, eg. keyboard interaction
    function trackNonClickInteraction(actionName) {
        google.trackNonClickInteraction(actionName);
    }

    function trackSamePageLinkClick(spec) {
        // Do not perform a same-page track link when there isn't a tag.
        if (spec.tag) {
            google.trackSamePageLinkClick(spec.target, spec.tag);
        }
    }

    function trackInternalLinkClick(spec) {
        // Store in session storage.
        // GA and Omniture will both pick it up on next page load,
        // then Omniture will remove it from storage.
        var storeObj = {
            path: loc.pathname,
            tag: spec.tag || 'untracked',
            time: new Date().getTime()
        };
        storage.sessionStorage.set(NG_STORAGE_KEY, storeObj);
    }

    function trackExternalLinkClick(spec) {
        // Execute the GA and Omniture tracking in parallel
        // and rely on Omniture to provide a 500 ms delay so they both get a chance to complete.
        // TODO when Omniture goes away, implement the delay ourselves.
        google.trackExternalLinkClick(spec.target, spec.tag);
    }

    function init(options) {
        options = options || {};
        if (options.location) {
            loc = options.location; // allow a fake location to be passed in for testing
        }
        addHandlers();
        mediator.emit('analytics:ready');
    }

    return {
        init: init,
        trackClick: trackClick,
        trackNonClickInteraction: trackNonClickInteraction
    };
});
