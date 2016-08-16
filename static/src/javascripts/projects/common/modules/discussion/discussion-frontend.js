define([
    'common/utils/report-error'
], function(
    reportError
) {
    function canRun(ab, curlConfig) {
        return (ab.isInVariant('DiscussionExternalFrontend', 'react') && curlConfig.paths['discussion-frontend-react']) ||
            (ab.isInVariant('DiscussionExternalFrontend', 'preact') && curlConfig.paths['discussion-frontend-preact']);
    }

    function load(ab, opts) {
        var requireVariant = ab.isInVariant('DiscussionExternalFrontend', 'react') ? 'react' : 'preact';
        return require('discussion-frontend-' + requireVariant, function (frontend) {
            // Preact works in a slightly different way
            // https://github.com/developit/preact-compat/issues/145
            if (requireVariant === 'preact') {
                opts.element.innerHTML = '';
            }
            frontend(opts)
            .then(function (emitter) {
                emitter.on('error', function (feature, error) {
                    reportError(error, { feature: 'discussion-' + feature }, false);
                });
            })
            .catch(function (error) {
                reportError(error, { feature: 'discussion' });
            });
        }, function (error) {
            reportError(error, { feature: 'discussion' });
        });
    }

    return {
        canRun: canRun,
        load: load
    };
});
