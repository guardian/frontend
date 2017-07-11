define([
    'lib/config',
    'common/modules/discussion/loader',
    'qwery'
], function (
    config,
    DiscussionLoader,
    qwery
) {
    return function () {
        if (config.switches.commentsVisibleOnArticle && config.page.commentable) {
            var el = qwery('.discussion')[0];
            if (el) {
                new DiscussionLoader().attachTo(el);
            }
        }
    };
});
