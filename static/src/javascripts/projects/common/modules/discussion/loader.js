define([
    'bean',
    'bonzo',
    'qwery',

    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/mediator',

    'common/modules/analytics/discussion',
    'common/modules/analytics/register',
    'common/modules/component',
    'common/modules/discussion/activity-stream',
    'common/modules/discussion/api',
    'common/modules/discussion/comment-box',
    'common/modules/discussion/comments',
    'common/modules/discussion/top-comments',
    'common/modules/identity/api'
], function(
    bean,
    bonzo,
    qwery,
    $,
    _,
    ajax,
    config,
    mediator,
    DiscussionAnalytics,
    register,
    Component,
    ActivityStream,
    DiscussionApi,
    CommentBox,
    Comments,
    TopComments,
    Id
) {

/**
 * We have a few rendering hacks in here
 * We'll move the rendering to the play app once we
 * have the discussion stack up that can read cookies
 * This is true for the comment-box / signin / closed discussion
 * And also the premod / banned state of the user
 * @constructor
 * @extends Component
 */
var Loader = function() {
    register.begin('discussion');
};
Component.define(Loader);

/**
 * @type {Object.<string.string>}
 * @override
 */
Loader.prototype.classes = {
    commentsContainer: 'discussion__comments__container',
    comments: 'discussion__comments',
    commentBox: 'discussion__comment-box',
    commentBoxBottom: 'discussion__comment-box--bottom',
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
        topCommentsElem = this.getElem('topComments'),
        commentsContainer = this.getElem('commentsContainer'),
        commentsElem = this.getElem('comments'),
        commentId = this.getCommentIdFromHash();

    if (commentId) {
        mediator.emit('discussion:seen:comment-permalink');
    }

    this.topComments = new TopComments({
        discussionId: this.getDiscussionId()
    });

    this.comments = new Comments({
        discussionId: this.getDiscussionId(),
        commentId: commentId ? commentId : null,
        order: this.getDiscussionClosed() ? 'oldest' : 'newest',
        state: 'partial'
    });

    this.topComments.fetch(topCommentsElem);

    this.comments.fetch(commentsElem).then(function() {
        $('.discussion .preload-msg').addClass('u-h');

        if (commentId || window.location.hash === '#comments') {
            self.comments.removeState('shut');
        }

        bonzo(commentsContainer).removeClass('modern-hidden');
        self.initUnthreaded();

        self.on('user:loaded', function() {
            self.renderCommentBar();
            if (self.user) {
                self.comments.addUser(self.user);
            }
        });
        self.getUser();
    });

    this.checkCommentsLoaded();

    this.renderCommentCount();

    DiscussionAnalytics.init();

    bean.on(window, 'hashchange', function() {
        var commentId = self.getCommentIdFromHash();
        if (commentId) {
            self.comments.gotoComment(commentId);
        }
    });

    // More for analytics than anything
    if (window.location.hash === '#comments') {
        mediator.emit('discussion:seen:comments-anchor');
    }

    register.end('discussion');
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
            activityStream.endpoint = '/discussion/non-threaded'+ this.getDiscussionId() + '.json?page=:page';
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
        DiscussionApi.getUser().then(function(resp) {
            self.user = resp.userProfile;
            self.emit('user:loaded');
        });
    } else {
        self.emit('user:loaded');
    }
};

Loader.prototype.renderReadOnly = function() {
    this.getElem('commentBox').innerHTML =
        '<div class="d-bar d-bar--closed">'+
            '<b>We’re doing some maintenance right now.</b>'+
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
    if (!this.user.privateFields) { // not signed in
        this.renderSignin();
    } else if (!this.user.privateFields.canPostComment) { // signed in but can't post
        this.renderUserBanned();
    } else { // signed in and can post
        this.commentBox = new CommentBox({
            discussionId: this.getDiscussionId(),
            premod: this.user.privateFields.isPremoderated
        });
        this.commentBox.render(this.getElem('commentBox'));

        this.commentBox.on('post:success', this.commentPosted.bind(this));
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
                    bonzo(qwery('.js-show-discussion, .js-show-discussion a')).attr('href', '#comments');

                    var commentCountLabel = (commentCount === 1) ? 'comment' : 'comments',
                        html = '<a href="#comments" class="js-show-discussion commentcount tone-colour" data-link-name="Comment count">' +
                               '  <i class="i"></i>' + commentCount +
                               '  <span class="commentcount__label">'+commentCountLabel+'</span>' +
                               '</a>';

                    bonzo(qwery('.js-comment-count')).html(html);
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

Loader.prototype.checkCount = 0;

Loader.prototype.checkCommentsLoaded = function() {

    // Limit the number of tries.
    if (++this.checkCount > 10 ) {
        return;
    }

    if (this.topComments.rendered && this.comments.rendered) {
        if (this.topComments.topCommentsAmount > 0) {
            this.comments.removeState('partial');
            this.comments.setState('shut');
        }
    } else {
        _.delay(this.checkCommentsLoaded.bind(this), 1000);
    }
};

return Loader;

}); //define
