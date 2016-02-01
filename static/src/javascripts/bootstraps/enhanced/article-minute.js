define([
    'common/utils/mediator',
    'bootstraps/enhanced/article-liveblog-common'
], function (
    mediator,
    articleLiveblogCommon
) {
    var ready = function () {
        articleLiveblogCommon();
        mediator.emit('page:minuteArticle:ready');
    };

    return {
        init: ready
    };
});
