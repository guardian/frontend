define([
    'ajax',
    'bonzo',
    'qwery',
    'modules/component',
    'modules/analytics/discussion',
    'modules/id',
    'modules/discussion/api',
    'modules/discussion/comments',
    'modules/discussion/comment-box'
], function(
    ajax,
    bonzo,
    qwery,
    Component,
    DiscussionAnalytics,
    Id,
    DiscussionApi,
    Comments,
    CommentBox
) {

/**
 * We have a few rendering hacks in here
 * We'll move the rendering to the play app once we
 * have the discussion stack up that can read cookies
 * This is true for the comment-box / sigin / closed discussion
 * And also the premod / banned state of the user
 * @constructor
 * @extends Component
 * @param {Element=} context
 * @param {Object} mediator
 * @param {Object=} options
 */
var Loader = function(context, mediator, options) {
    this.context = context || document;
    this.mediator = mediator;
    this.setOptions(options);
};
Component.define(Loader);

/** @type {Element} */
Loader.prototype.context = null;

/** @type {Object.<string.*>} */
Loader.CONFIG = {
    componentClass: 'discussion',
    classes: {
        comments: 'discussion__comments',
        commentBox: 'discussion__comment-box',
        commentBoxBottom: 'discussion__comment-box--bottom',
        show: 'd-show-cta'
    }
};

/** @type {Comments} */
Loader.prototype.comments = null;

/** @type {CommentBox} */
Loader.prototype.commentBox = null;

/** @type {CommentBox} */
Loader.prototype.bottomCommentBox = null;

/** @type {Object.<srtring.*>} */
Loader.prototype.user = null;

/** @type {boolean} */
Loader.prototype.canComment = false;

/** @override */
Loader.prototype.ready = function() {
    var id = this.getDiscussionId();

    // TODO (jamesgorrie): Move this into the Comments module
    this.getElem('comments').innerHTML = '<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>';
    this.comments = new Comments(this.context, this.mediator, {
        initialShow: 2,
        discussionId: this.getDiscussionId()
    });
    this.comments.load(this.getElem('comments'));
    // ajax({
    //     url: '/discussion'+ id +'.json',
    //     type: 'json',
    //     method: 'get',
    //     crossOrigin: true
    // }).then(this.renderDiscussion.bind(this), this.loadingError.bind(this));


    bonzo(this.getElem('show')).remove();
    DiscussionAnalytics.init();
    this.renderCommentCount();
};

/**
 * @param {Object} resp
 */
Loader.prototype.renderDiscussion = function(resp) {
    var commentsElem = this.getElem('comments');

    // comments
    commentsElem.innerHTML = resp.html;
    this.comments = new Comments(this.context, this.mediator, {
        initialShow: 2,
        discussionId: this.getDiscussionId()
    });
    this.comments.attachTo(commentsElem);

    this.renderCommentBar();
};

/**
 * Just removes the comments module
 * This state should never really be reached but
 * often is on code due to syncing problems
 */
Loader.prototype.loadingError = function() {
    bonzo(this.elem).remove();
};

/**
 * If discussion is closed -> render closed
 * If not signed in -> render signin,
 * Else render comment box
 */
Loader.prototype.renderCommentBar = function() {
    var user = Id.getUserFromCookie();

    if (this.getDiscussionClosed()) {
        this.renderDiscussionClosedMessage();
    } else if (!user) {
        this.renderSignin();
    } else {
        this.renderCommentBox();
        this.comments.on('first-load', this.renderBottomCommentBox.bind(this));
        this.canComment = true;
    }
};

/** TODO: This logic will be moved to the Play app renderer */
Loader.prototype.renderDiscussionClosedMessage = function() {
    this.getElem('commentBox').innerHTML = '<div class="d-bar d-bar--closed">This discussion is closed for comments.</div>';
};

/** TODO: This logic will be moved to the Play app renderer */
Loader.prototype.renderSignin = function() {
    var url = Id.getUrl() +'/{1}?returnUrl='+ window.location.href;
    this.getElem('commentBox').innerHTML =
        '<div class="d-bar d-bar--signin">Open for comments. <a href="'+
            url.replace('{1}', 'signin') +'">Sign in</a> or '+
            '<a href="'+ url.replace('{1}', 'register') +'">create your Guardian account</a> '+
            'to join the discussion.'+
        '</div>';
};

/** TODO: This logic will be moved to the Play app renderer */
Loader.prototype.renderCommentBox = function() {
    var success = function(resp) {
        var user = resp.userProfile;
        this.user = user;
        // If this privateFields aren't there,
        // they're not the right person
        // More a sanity check than anything
        if (!user.privateFields) {
            this.renderSignin();
        } else if (!user.privateFields.canPostComment) {
            this.renderUserBanned();
        } else {
            this.commentBox = new CommentBox(this.context, this.mediator, {
                discussionId: this.getDiscussionId()
            });
            this.commentBox.render(this.getElem('commentBox'));
            if (!user.privateFields.isPremoderated) {
                bonzo(qwery('.d-comment-box__premod'), this.commentBox.elem).remove();
            }
            this.commentBox.on('post:success', this.addComment.bind(this));
        }
    };

    DiscussionApi
        .getUser()
        .then(success.bind(this));
};

/**
 * This comment box is only rendered
 * When you load more comments
 */
Loader.prototype.renderBottomCommentBox = function() {
    var commentBoxElem = bonzo(this.commentBox.elem).clone()[0];
    bonzo(this.getElem('commentBoxBottom')).append(commentBoxElem);

    this.bottomCommentBox = new CommentBox(this.context, this.mediator, {
        discussionId: this.getDiscussionId()
    });
    this.bottomCommentBox.attachTo(commentBoxElem);
    this.bottomCommentBox.on('post:success', this.addComment.bind(this));
};

/**
 * TODO (jamesgorrie): Move this functionality over to component
 * It hasn't been done yet as I don't have a comment component
 * @param {object.<string.*>} comment
 */
Loader.prototype.addComment = function(comment) {
    var key, val, selector, elem,
        attr,
        map = {
            username: 'd-comment__author',
            timestamp: 'js-timestamp',
            body: 'd-comment__body',
            report: 'd-comment__action--report',
            avatar: 'd-comment__avatar'
        },
        values = {
            username: this.user.displayName,
            timestamp: 'Just now',
            body: '<p>'+ comment.body.replace('\n', '</p><p>') +'</p>',
            report: {
                href: 'http://discussion.theguardian.com/components/report-abuse/'+ comment.id
            },
            avatar: {
                src: this.user.avatar
            }
        },
        commentElem = bonzo.create(document.getElementById('tmpl-comment').innerHTML)[0];

    for (key in map) {
        if (map.hasOwnProperty(key)) {
            selector = map[key];
            val = values[key];
            elem = qwery('.'+ selector, commentElem)[0];
            if (typeof val === 'string') {
                elem.innerHTML = val;
            } else {
                for (attr in val) {
                    elem.setAttribute(attr, val[attr]);
                }
            }
        }
    }
    commentElem.id = 'comment-'+ comment.id;
    bonzo(this.comments.getElem('comments')).prepend(commentElem);
    window.location.hash = '';
    window.location.hash = '#comment-'+ comment.id;
};

/**
 * @return {string}
 */
Loader.prototype.getDiscussionId = function() {
    return this.elem.getAttribute('data-discussion-key');
};

/**
 * @return {boolean}
 */
Loader.prototype.getDiscussionClosed = function() {
    return this.elem.getAttribute('data-discussion-closed') === 'true';
};

/**
 * TODO (jamesgorrie): Needs a refactor, good ol' copy and paste.
 */
Loader.prototype.renderCommentCount = function() {
    ajax({
        url: '/discussion/comment-counts.json?shortUrls=' + this.getDiscussionId(),
        type: 'json',
        method: 'get',
        crossOrigin: true,
        success: function(response) {
            if(response && response.counts &&response.counts.length) {
                var commentCount = response.counts[0].count;
                if (commentCount > 0) {
                    // Remove non-JS links
                    bonzo(qwery('.js-show-discussion, .js-show-discussion a', this.context)).attr('href', '#comments');

                    var commentCountLabel = (commentCount === 1) ? 'comment' : 'comments',
                        html = '<a href="#comments" class="js-show-discussion commentcount tone-colour" data-link-name="Comment count">' +
                               '  <i class="i"></i>' + commentCount +
                               '  <span class="commentcount__label">'+commentCountLabel+'</span>' +
                               '</a>';

                    qwery('.js-commentcount__number', this.context).innerHTML = commentCount;
                    bonzo(qwery('.js-comment-count', this.context)).html(html);
                }
            }
        }
    });
};

return Loader;

}); //define