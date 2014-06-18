define([
    'common/$',
    'common/utils/ajax',
    'bonzo',
    'qwery',
    'bean',
    'common/modules/component',
    'common/modules/analytics/register',
    'common/modules/analytics/discussion',
    'common/modules/identity/api',
    'common/modules/discussion/api',
    'common/modules/discussion/comments',
    'common/modules/discussion/top-comments',
    'common/modules/discussion/comment-box',
    'common/modules/discussion/activity-stream'
], function(
    $,
    ajax,
    bonzo,
    qwery,
    bean,
    Component,
    register,
    DiscussionAnalytics,
    Id,
    DiscussionApi,
    Comments,
    TopComments,
    CommentBox,
    ActivityStream
) {

/**
 * We have a few rendering hacks in here
 * We'll move the rendering to the play app once we
 * have the discussion stack up that can read cookies
 * This is true for the comment-box / signin / closed discussion
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
    register.begin('discussion');
};
Component.define(Loader);

/** @type {Element} */
Loader.prototype.context = null;

Loader.prototype.defaultOptions = {
    switches: {}
};

/**
 * @type {Object.<string.string>}
 * @override
 */
Loader.prototype.classes = {
    commentsContainer: 'discussion__comments__container',
    comments: 'discussion__comments',
    commentBox: 'discussion__comment-box',
    commentBoxBottom: 'discussion__comment-box--bottom',
    joinDiscussion: 'd-discussion__show-all-comments',
    topComments: 'discussion__comments--top-comments'
};

/**
 * @type {string}
 * @override
 */
Loader.prototype.componentClass = 'discussion';

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
    var self = this,
        topCommentsElem = this.getElem('topComments');

    this.topLoadingElem = bonzo.create('<div class="preload-msg">Loading comments… <a href="/discussion'+ this.getDiscussionId() +'" class="accessible-link">Trouble loading?</a><div class="is-updating"></div></div>')[0];
    bonzo(this.topLoadingElem).insertAfter(topCommentsElem);

    this.on('user:loaded', function() {
        this.topComments = new TopComments(self.context, self.mediator, {
            discussionId: this.getDiscussionId(),
            user: self.user
        });

        this.topComments
            .fetch(topCommentsElem)
            .then(function appendTopComments() {
                bonzo(self.topLoadingElem).addClass('u-h');
            });

        this.mediator.on('module:topcomments:loadcomments', self.loadComments.bind(self));
    });

    this.getUser();
    this.renderCommentCount();
    DiscussionAnalytics.init();

    bean.on(window, 'hashchange', function() {
        var commentId = self.getCommentIdFromHash();
        if (commentId) {
            self.comments.gotoComment(commentId);
            bonzo(self.getElem('joinDiscussion')).addClass('u-h');
        }
    });

    // More for analytics than anything
    if (window.location.hash === '#comments') {
        this.mediator.emit('discussion:seen:comments-anchor');
    }

    register.end('discussion');
};

Loader.prototype.loadComments = function(args) {
    args = args || {};
    var self = this,
        commentsContainer = this.getElem('commentsContainer'),
        commentsElem = this.getElem('comments'),
        loadingElem = bonzo.create(
            '<div class="preload-msg d-discussion__loader--comments">'+
                'Loading comments…'+
                '<div class="is-updating"></div>'+
            '</div>')[0],
        commentId = this.getCommentIdFromHash(),
        showComments = args.showLoader || commentId || window.location.hash === '#comments';

    if (args.showLoader) {
        // Comments are being loaded in the no-top-comments-available context
        bonzo(commentsContainer).removeClass('u-h');
    }

    bonzo(self.topLoadingElem).addClass('u-h');
    bonzo(loadingElem).insertAfter(commentsContainer);

    if (commentId) {
        this.mediator.emit('discussion:seen:comment-permalink');
    }

    this.comments = new Comments(this.context, this.mediator, {
        discussionId: this.getDiscussionId(),
        user: this.user,
        commentId: commentId ? commentId : null,
        order: this.getDiscussionClosed() ? 'oldest' : 'newest',
        state: this.topComments.topCommentsAmount > 0 ? 'shut' : 'partial'
    });

    // Doing this makes sure there is only one redraw
    // Within comments there is adding of reply buttons etc
    this.comments.fetch(commentsElem)
        .then(function killLoadingMessage() {
            bonzo(loadingElem).addClass('u-h');
            self.renderCommentBar(self.user);

            if (showComments) {
                // Comments are being loaded in the no-top-comments-available context
                bonzo(self.comments.getElem('header')).removeClass('u-h');
                self.comments.removeState('shut');
            }

            self.on('click', self.getElem('joinDiscussion'), function (e) {
                self.comments.showHiddenComments(e);
                self.cleanUpOnShowComments();
            });
            bonzo(commentsContainer).removeClass('js-hidden');
            self.initUnthreaded();
        }).fail(self.loadingError.bind(self));
};

Loader.prototype.initUnthreaded = function() {
    var self = this;
    // Non threaded view
    var $discussionContainer = $('.js-discussion-container', this.elem),
        $nonThreadedContainer = $('.js-discussion__non-threaded', this.elem),
        $loader = $('.d-discussion__loader--comments', this.elem),
        $state = $('.discussion__show-threaded-state', this.elem);

    this.on('click', '.js-show-threaded', function(e) {
        var $el = bonzo(e.currentTarget);

        $state.toggleClass('u-h');
        $nonThreadedContainer.toggleClass('u-h');
        $discussionContainer.toggleClass('u-h');

        if (!$el.data('loaded')) {
            var activityStream = new ActivityStream();

            $el.data('loaded', true);
            $loader.removeClass('u-h');
            activityStream.endpoint = '/discussion/non-threaded'+ this.getDiscussionId() + '.json';
            activityStream
                .fetch($nonThreadedContainer[0])
                .then(function() {
                    $loader.addClass('u-h');
                });
        }
    });

    this.on('click', '.js-comment-permalink', function(e) {
        var promise = self.comments.gotoComment(e.currentTarget.getAttribute('data-comment-id'));
        e.preventDefault();
        $nonThreadedContainer.addClass('u-h');
        $state.removeClass('u-h');
        self.comments.showHiddenComments();

        if (promise) {
            $loader.removeClass('u-h');
            promise.then(function() {
                $loader.addClass('u-h');
                $discussionContainer.removeClass('u-h');
            });
        } else {
            $discussionContainer.removeClass('u-h');
        }
    });
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
    bonzo(this.getElem('commentsContainer')).remove();
};

Loader.prototype.renderReadOnly = function() {
    this.getElem('commentBox').innerHTML =
        '<div class="d-bar d-bar--closed">'+
            '<b>We\'re doing some maintenance right now.</b>'+
            ' You can still read comments, but please come back later to add your own.'+
        '</div>';
};

/** TODO: This logic will be moved to the Play app renderer */
Loader.prototype.renderDiscussionClosedMessage = function() {
    this.getElem('commentBox').innerHTML = '<div class="d-bar d-bar--closed">This discussion is closed for comments.</div>';
};

/** TODO: This logic will be moved to the Play app renderer */
Loader.prototype.renderSignin = function() {
    var url = Id.getUrl() +'/{1}?returnUrl='+ window.location.href;
    this.getElem('commentBox').innerHTML =
        '<div class="d-bar d-bar--signin">Open for comments. <a class="u-underline" href="'+
            url.replace('{1}', 'signin') +'">Sign in</a> or '+
            '<a class="u-underline" href="'+ url.replace('{1}', 'register') +'">create your Guardian account</a> '+
            'to join the discussion.'+
        '</div>';
};

/**
 * If discussion is closed -> render closed
 * If not signed in -> render signin,
 * Else render comment box
 */
Loader.prototype.renderCommentBar = function() {
    if (this.comments.isReadOnly()) {
        this.renderReadOnly();
    } else if (this.getDiscussionClosed()) {
        this.renderDiscussionClosedMessage();
    } else if (!Id.getUserFromCookie()) {
        this.renderSignin();
    } else {
        this.renderCommentBox();
        this.comments.on('first-load', this.renderBottomCommentBox.bind(this));
        this.comments.on('first-load', this.cleanUpOnShowComments.bind(this));
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
        this.commentBox = new CommentBox({
            discussionId: this.getDiscussionId(),
            premod: this.user.privateFields.isPremoderated,
            switches: this.options.switches
        });
        this.commentBox.render(this.getElem('commentBox'));
        this.commentBox.on('post:success', this.commentPosted.bind(this));
        this.canComment = true;
    }
};

/* Logic determining if extra comments should be shown along with the posted comment to ensure context */
Loader.prototype.commentPosted = function () {
    this.comments.addComment.apply(this.comments, arguments);

    // Should more comments be shown?
    if (!this.firstComment) {
        this.firstComment = true;
        this.comments.showHiddenComments();
        this.cleanUpOnShowComments();
    }

};

/* Configure DOM for viewing of comments once some have been shown */
Loader.prototype.cleanUpOnShowComments = function () {
    bonzo(this.comments.getElem('header')).removeClass('u-h');
    bonzo(this.getElem('joinDiscussion')).addClass('u-h');
};

Loader.prototype.renderUserBanned = function() {
    this.getElem('commentBox').innerHTML = '<div class="d-bar d-discussion__error d-bar--banned">Commenting has been disabled for this account (<a href="/community-faqs#321a">why?</a>).</div>';
};

/**
 * This comment box is only rendered
 * When you load more comments
 */
Loader.prototype.renderBottomCommentBox = function() {
    if (this.bottomCommentBox) { return; }
    this.bottomCommentBox = new CommentBox({
        discussionId: this.getDiscussionId(),
        premod: this.user.privateFields.isPremoderated
    });
    this.bottomCommentBox.render(this.getElem('commentBoxBottom'));
    this.bottomCommentBox.on('post:success', function(comment) {
        this.comments.addComment(comment, true);
    }.bind(this));
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

                    bonzo(qwery('.js-comment-count', this.context)).html(html);
                }
            }
        }
    });
};

/**
 * @return {number}
 */
Loader.prototype.getCommentIdFromHash = function() {
    var reg = (/#comment-(\d+)/);
    return reg.exec(window.location.hash) ? parseInt(reg.exec(window.location.hash)[1], 10) : null;
};

return Loader;

}); //define
