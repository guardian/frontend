define([
    'common/utils/mediator',
    'common/utils/report-error'
], function(
    mediator,
    reportError
) {
    function load(ab, loader, opts) {
        function onDiscussionFrontendLoad (emitter) {
            emitter.on('error', function (feature, error) {
                reportError(error, { feature: 'discussion-' + feature }, false);
            });
            emitter.once('comment-count', function (value) {
                if (value === 0) {
                    loader.setState('empty');
                }
                mediator.emit('comments-count-loaded');
            });
        }

        return require('discussion-frontend-preact', function (frontend) {
            // - Inject the net module to work around the lack of a global fetch
            //   It can be removed once all browsers have window.fetch
            // - Well, it turns out that fetchJson uses reqwest which sends X-Requested-With
            //   which is not allowed by Access-Control-Allow-Headers, so don't use reqwest
            //   until discussion API is fixed
            // - Once fixed, or a global fetch is available through a polyfill, one can
            //   modify discussion-frontend to remove `fetch` polyfill and pass, if needed,
            //   opts.net = { json: fetchJson }

            // Show the sticky banner only if we are in the AB test and other banners are not visible
            var noOtherBanners = !otherBannersVisible();
            opts.featureStickyBanner = ab.isInVariant('DiscussionPromoteComments', 'bottom-banner') && noOtherBanners;
            opts.featureTopBanner = ab.isInVariant('DiscussionPromoteComments', 'top-banner') && noOtherBanners;
            opts.featureStickyBadge = ab.isInVariant('DiscussionPromoteComments', 'bubble') && noOtherBanners;
            opts.featureStickyBannerDismissable = true;

            frontend(opts)
            .then(onDiscussionFrontendLoad)
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
        load: load
    };
});
