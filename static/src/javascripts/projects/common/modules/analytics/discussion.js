/* global s */
define([
    'bonzo',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/analytics/omniture',
    'common/modules/identity/api',
    'lodash/functions/debounce'
], function (
    bonzo,
    $,
    mediator,
    omniture,
    Id,
    debounce
) {

    /**
     * event51: Comment
     * event72: Engagement event (e.g. recommendation)
     * eVar65: Only for event72. Type of interaction (any string)
     * eVar66: User ID of current user
     * eVar67: User ID of person being acted upon
     * eVar68: Only for event51. comment || response
     */
    var track = {};
    track.seen = false;

    /**
     * @param {Array.<string>}
     * @return {string}
     */
    track.getLinkTrackVars = function (extras) {
        extras = extras || [];
        var linkTrackVars = ['prop6', 'prop19', 'prop75', 'eVar8',  'eVar19', 'eVar31', 'eVar51', 'eVar66'];
        return ',' + linkTrackVars.concat(extras).join(',');
    };

    track.comment = function (comment) {
        // Add extra variables for discussion.
        omniture.populateEventProperties('comment');
        s.events += ',event51';
        s.linkTrackVars += this.getLinkTrackVars(['eVar68']);
        s.linkTrackEvents += ',event51';

        s.eVar66 = Id.getUserFromCookie().id || null;
        s.eVar68 = comment.replyTo ? 'response' : 'comment';
        s.eVar67 = comment.replyTo ? comment.replyTo.authorId : null;
        s.tl(true, 'o', 'comment');
    };

    track.recommend = function (e) {
        omniture.populateEventProperties('Recommend a comment');
        s.events += ',event72';
        s.linkTrackVars += this.getLinkTrackVars(['eVar65', 'eVar67']);
        s.linkTrackEvents += ',event72';

        s.eVar65 = 'recommendation';
        s.eVar66 = Id.getUserFromCookie() ? Id.getUserFromCookie().id : null;
        s.eVar67 = e.userId;
        s.tl(true, 'o', 'Recommend a comment');
    };

    track.jumpedToComments = function () {
        if (!track.seen) {
            omniture.populateEventProperties('seen jump-to-comments');
            s.events += ',event72';
            s.linkTrackVars += this.getLinkTrackVars(['eVar65']);
            s.linkTrackEvents += ',event72';

            s.eVar65 = 'seen jump-to-comments';
            s.eVar66 = Id.getUserFromCookie() ? Id.getUserFromCookie().id : null;
            s.tl(true, 'o', 'seen jump-to-comments');
            track.seen = true;
        }
    };

    track.commentPermalink = function () {
        if (!track.seen) {
            omniture.populateEventProperties('seen comment-permalink');
            s.events += ',event72';
            s.linkTrackVars += this.getLinkTrackVars(['eVar65']);
            s.linkTrackEvents += ',event72';

            s.eVar65 = 'seen comment-permalink';
            s.eVar66 = Id.getUserFromCookie() ? Id.getUserFromCookie().id : null;
            s.tl(true, 'o', 'seen comment-permalink');
            track.seen = true;
        }
    };

    track.scrolledToComments = function () {
        if (!track.seen) {
            omniture.populateEventProperties('seen scroll-top');
            s.events += ',event72';
            s.linkTrackVars += this.getLinkTrackVars(['eVar65']);
            s.linkTrackEvents += ',event72';

            s.eVar65 = 'seen scroll-top';
            s.eVar66 = Id.getUserFromCookie() ? Id.getUserFromCookie().id : null;
            s.tl(true, 'o', 'seen scroll-top');
            track.seen = true;
        }
    };

    // Convenience functions
    track.areCommentsSeen = function () {
        var timer,
            scroll = function () {
                if (!track.seen && !timer && track.areCommentsVisible()) {
                    track.scrolledToComments();
                    mediator.off('window:throttledScroll', debounce(scroll, 200));
                }
            };

        if (!track.seen) {
            mediator.on('window:throttledScroll', debounce(scroll, 200));
        }
    };

    track.areCommentsVisible = function () {
        var comments = $('#comments').offset(),
            scrollTop = window.pageYOffset,
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
