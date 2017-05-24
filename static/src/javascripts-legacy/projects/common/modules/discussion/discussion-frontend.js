define([
    'fastdom',
    'lib/formatters',
    'lib/mediator',
    'lib/report-error',
    'lib/config',
    'lib/load-script'
], function(
    fastdom,
    formatters,
    mediator,
    reportError,
    config,
    loadScript
) {
    function load(loader, opts) {
        function onDiscussionFrontendLoad (emitter) {
            emitter.on('error', function (feature, error) {
                reportError(error, { feature: 'discussion-' + feature }, false);
            });
            emitter.once('comment-count', function (value) {
                if (value === 0) {
                    loader.setState('empty');
                } else {
                    // By the time discussion frontent loads, the number of comments
                    // might have changed. If there are other comment counts element
                    // in the page refresh their value.
                    var otherValues = document.getElementsByClassName('js_commentcount_actualvalue');
                    for (var i = 0, len = otherValues.length; i < len; i += 1) {
                        updateCommentCount(otherValues[i], value);
                    }
                }
                mediator.emit('comments-count-loaded');
            });
        }

        function updateCommentCount (element, value) {
            fastdom.write(function () {
                element.textContent = formatters.integerCommas(value);
            });
        }

        function error (error) {
            reportError(error, { feature: 'discussion' });
        }

        function init (frontend) {
            frontend(opts)
                .then(onDiscussionFrontendLoad)
                .catch(error);
        }

        // - Inject the net module to work around the lack of a global fetch
        //   It can be removed once all browsers have window.fetch
        // - Well, it turns out that fetchJson uses reqwest which sends X-Requested-With
        //   which is not allowed by Access-Control-Allow-Headers, so don't use reqwest
        //   until discussion API is fixed
        // - Once fixed, or a global fetch is available through a polyfill, one can
        //   modify discussion-frontend to remove `fetch` polyfill and pass, if needed,
        //   opts.net = { json: fetchJson }

        return loadScript.loadScript(config.page.discussionFrontendUrl)
            .then(function() {
                init(window.guardian.app.discussion);
            })
            .catch(error);
    }

    return {
        load: load
    };
});
