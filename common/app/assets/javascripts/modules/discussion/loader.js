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

/** @type {Object.<string.*>} */
Loader.prototype.user = null;

/** @type {boolean} */
Loader.prototype.canComment = false;

/**
 * @override
 * We need the user for comments
 * We also need them for the comment bar
 * So the flow is essentially:
 * 1. fetch user
 * 2. fetch comments
 * 3. render comment bar
 */
Loader.prototype.ready = function() {
    var id = this.getDiscussionId(),
        loadingElem = bonzo.create('<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>')[0],
        commentsElem = this.getElem('comments'),
        self = this;

    bonzo(loadingElem).insertAfter(commentsElem);

    this.on('user:loaded', function(user) {
        var self = this;
        this.comments = new Comments(this.context, this.mediator, {
            initialShow: 2,
            discussionId: this.getDiscussionId(),
            user: this.user
        });

        // Doing this makes sure there is only one redraw
        // Within comments there is adding of reply buttons etc
        bonzo(commentsElem).addClass('u-h');
        this.comments
            .fetch(commentsElem)
            .then(function killLoadingMessage() {
                bonzo(loadingElem).remove();
                self.renderCommentBar(user);
                bonzo(commentsElem).removeClass('u-h');
            });
    });
    this.getUser();

    this.renderCommentCount();

    bonzo(this.getElem('show')).remove();
    DiscussionAnalytics.init();
};

/** @return {Reqwest|null} */
Loader.prototype.getUser = function() {
    var self = this;

    if (Id.getUserFromCookie()) {
        return DiscussionApi
            .getUser()
            .then(function(resp) {
                self.user = resp.userProfile;
                self.emit('user:loaded', resp.userProfile);
            });
    } else {
        self.emit('user:loaded');
    }
};

/**
 * Just removes the comments module
 * This state should never really be reached but
 * often is on code due to syncing problems
 */
Loader.prototype.loadingError = function() {
    bonzo(this.elem).remove();
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

/**
 * If discussion is closed -> render closed
 * If not signed in -> render signin,
 * Else render comment box
 */
Loader.prototype.renderCommentBar = function() {
    if (this.getDiscussionClosed()) {
        this.renderDiscussionClosedMessage();
    } else if (!Id.getUserFromCookie()) {
        this.renderSignin();
    } else {
        this.renderCommentBox();
        this.comments.on('first-load', this.renderBottomCommentBox.bind(this));
    }
};

/**
 * TODO: This logic will be moved to the Play app renderer
 */
Loader.prototype.renderCommentBox = function() {
    // If this privateFields aren't there,
    // they're not the right person
    // More a sanity check than anything
    if (!this.user.privateFields) {
        this.renderSignin();
    } else if (!this.user.privateFields.canPostComment) {
        this.renderUserBanned();
    } else {
        this.commentBox = new CommentBox(this.context, this.mediator, {
            discussionId: this.getDiscussionId(),
            premod: this.user.privateFields.isPremoderated
        });
        this.commentBox.render(this.getElem('commentBox'));
        this.commentBox.on('post:success', this.addComment.bind(this));
        this.canComment = true;
    }
};

Loader.prototype.renderUserBanned = function() {
    this.getElem('commentBox').innerHTML = '<div class="d-bar d-bar--banned">Commenting has been disabled for this account (<a href="/community-faqs#321a">why?</a>).</div>';
};

/**
 * This comment box is only rendered
 * When you load more comments
 */
Loader.prototype.renderBottomCommentBox = function() {
    this.bottomCommentBox = new CommentBox(this.context, this.mediator, {
        discussionId: this.getDiscussionId(),
        premod: this.user.privateFields.isPremoderated
    });
    this.bottomCommentBox.render(this.getElem('commentBoxBottom'));
    this.bottomCommentBox.on('post:success', this.addComment.bind(this, true));
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