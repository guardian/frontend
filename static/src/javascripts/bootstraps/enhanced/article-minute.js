define([
    'fastdom',
    'common/utils/$',
    'common/utils/mediator',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail',
    'common/utils/proximity-loader',
    'common/modules/onward/inject-container',
    'common/utils/config',
    'lodash/utilities/noop',
    'common/modules/ui/full-height'
], function (
    fastdom,
    $,
    mediator,
    articleLiveblogCommon,
    trail,
    proximityLoader,
    injectContainer,
    config,
    noop,
    fullHeight
) {
    var ready = function () {
        articleLiveblogCommon();
        trail();
        mediator.emit('page:minuteArticle:ready');
        fullHeight.init();

        if (config.page.isMinuteArticle && !config.page.showRelatedContent) {
            // Inject the us elections top stories for the US-Minute instead of
            // related container - Uses the functionality from running A/B test
            // https://github.com/guardian/frontend/pull/11254/files
            var $onward = $('.js-onward');

            proximityLoader.add($onward, 1500, function () {
                fastdom.write(function () {
                    injectContainer.injectContainer('/container/us-news/us-elections-2016/some/1/0/none/us.json', $onward, 'inject-network-front-0', noop);
                });
            });
        }
    };

    return {
        init: ready
    };
});
