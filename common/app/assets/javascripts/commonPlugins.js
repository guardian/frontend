//these are plugins required by all pages
define([guardian.js.modules.analytics, guardian.js.modules.ads], function(analytics){});

if (guardian.page.commentable) {
    require([guardian.js.modules.fetchDiscussion,
        guardian.js.modules.discussionBinder],
        function(discussion, discussionBinder) {

            // fetch comments html
            discussion.fetchCommentsForContent(
                guardian.page.shortUrl,
                guardian.config.discussion.numCommentsPerPage,
                1, // pageOffset
                discussionBinder.renderDiscussion // callback to send HTML output to
            );

        }
    );
}