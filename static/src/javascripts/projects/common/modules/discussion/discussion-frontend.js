define([
    'common/utils/fetch-json',
    'common/utils/mediator',
    'common/utils/report-error'
], function(
    fetchJson,
    mediator,
    reportError
) {
    function canRun(ab, curlConfig) {
        return (ab.isInVariant('DiscussionExternalFrontendAvatar', 'react') && curlConfig.paths['discussion-frontend-react']) ||
            (ab.isInVariant('DiscussionExternalFrontendAvatar', 'preact') && curlConfig.paths['discussion-frontend-preact']);
    }

    function load(ab, loader, opts) {
        var requireVariant = ab.isInVariant('DiscussionExternalFrontendAvatar', 'react') ? 'react' : 'preact';
        return require('discussion-frontend-' + requireVariant, function (frontend) {
            // Preact works in a slightly different way
            // https://github.com/developit/preact-compat/issues/145
            if (requireVariant === 'preact') {
                opts.element.innerHTML = '';
            }
            // Inject the net module to work around the lack of a global fetch
            // It can be removed once all browsers have window.fetch
            // Well, it turns out that fetchJson uses reqwest which sends X-Requested-With
            // which is not allowed by Access-Control-Allow-Headers, so don't use reqwest
            // until discussion API is fixed
            // opts.net = {
            //     json: fetchJson
            // };

            // Show the sticky banner only if we are in the AB test and other banners are not visible
            var noOtherBanners = !otherBannersVisible();
            opts.featureStickyBanner = ab.isInVariant('DiscussionPromoteComments', 'bottom-banner') && noOtherBanners;
            opts.featureTopBanner = ab.isInVariant('DiscussionPromoteComments', 'top-banner') && noOtherBanners;
            opts.featureStickyBadge = ab.isInVariant('DiscussionPromoteComments', 'bubble') && noOtherBanners;
            opts.featureStickyBannerDismissable = true;

            frontend(opts)
            .then(function (emitter) {
                emitter.on('error', function (feature, error) {
                    reportError(error, { feature: 'discussion-' + feature }, false);
                });
                emitter.once('comment-count', function (value) {
                    if (value === 0) {
                        loader.setState('empty');
                    }
                    mediator.emit('comments-count-loaded');
                });
            })
            .catch(function (error) {
                reportError(error, { feature: 'discussion' });
            });
        }, function (error) {
            reportError(error, { feature: 'discussion' });
        });
    }

    function otherBannersVisible () {
        var siteMessage = document.getElementsByClassName('js-site-message');
        if (siteMessage.length && !siteMessage[0].classList.contains('is-hidden')) {
            // Contribution banner is visible
            return true;
        }
        var breakingNews = document.getElementsByClassName('js-breaking-news-placeholder');
        if (breakingNews.length && !breakingNews[0].classList.contains('breaking-news--hidden')) {
            // Breaking news alert is visible
            return true;
        }
        return false;
    }

    return {
        canRun: canRun,
        load: load
    };
});
