define([
    'bonzo',
    'lodash/functions/debounce',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/analytics/omniture'
], function (
    bonzo,
    debounce,
    $,
    mediator,
    omniture
) {
    var track = {
        seen: false
    };

    track.comment = function () {
        omniture.trackLinkImmediate('comment');
    };

    track.recommend = function () {
        omniture.trackLinkImmediate('Recommend a comment');
    };

    track.jumpedToComments = function () {
        if (!track.seen) {
            omniture.trackLinkImmediate('seen jump-to-comments');
            track.seen = true;
        }
    };

    track.commentPermalink = function () {
        if (!track.seen) {
            omniture.trackLinkImmediate('seen comment-permalink');
            track.seen = true;
        }
    };

    track.scrolledToComments = function () {
        if (!track.seen) {
            omniture.trackLinkImmediate('seen scroll-top');
            track.seen = true;
        }
    };

    // Convenience functions
    track.areCommentsSeen = function () {
        var timer,
            scroll = function () {
                if (!track.seen && !timer && track.areCommentsVisible()) {
                    track.scrolledToComments();
                    mediator.off('window:scroll', debounce(scroll, 200));
                }
            };

        if (!track.seen) {
            mediator.on('window:scroll', debounce(scroll, 200));
        }
    };

    track.areCommentsVisible = function () {
        var comments = $('#comments').offset(),
            scrollTop = $('body').first().scrollTop(),
            viewport = bonzo.viewport().height;

        if ((comments.top - ((viewport  / 2)) < scrollTop) &&
            ((comments.top + comments.height) - (viewport / 3) > scrollTop)) {
            return true;
        } else {
            return false;
        }
    };

    return {
        init: function () {
            mediator.on('discussion:commentbox:post:success', track.comment.bind(track));
            mediator.on('discussion:comment:recommend:success', track.recommend.bind(track));
            mediator.on('discussion:seen:comment-permalink', track.commentPermalink.bind(track));
            mediator.on('discussion:seen:comments-anchor', track.jumpedToComments.bind(track));
            mediator.on('discussion:seen:comments-scrolled-to', track.scrolledToComments.bind(track));

            track.areCommentsSeen();
        }
    };

}); // define
