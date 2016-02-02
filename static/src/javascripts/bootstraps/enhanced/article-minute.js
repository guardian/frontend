define([
    'common/utils/mediator',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail'
], function (
    mediator,
    articleLiveblogCommon,
    trail
) {
    var ready = function () {
        articleLiveblogCommon();
        trail();
        mediator.emit('page:minuteArticle:ready');
    };

    return {
        init: ready
    };
});
