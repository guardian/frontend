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
    'common/modules/identity/api',
    'common/modules/userPrefs'
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
    Id,
    userPrefs
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
    commentBoxBottom: 'discussion__comment-box--bottom'
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

Loader.prototype.loadTopComments = function() {

    this.on('click', '.js-jump-to-comment', function(e) {
        e.preventDefault();
    });

    return ajax({
        url: '/discussion/' + this.getDiscussionId() + '.json',
        type: 'json',
        method: 'get',
        crossOrigin: true,
        data: { topComments: true }
    }).then(
        function render(resp) {
            this.$topCommentsContainer.html(resp.html);
        }.bind(this),
        function () {
        }
    );
};


Loader.prototype.ready = function() {

    this.$topCommentsContainer = $('.js-discussion-top-comments');

    var commentsContainer = this.getElem('commentsContainer'),
        commentsElem = this.getElem('comments'),
        commentId = this.getCommentIdFromHash();

    if (commentId) {
        mediator.emit('discussion:seen:comment-permalink');
    }

    this.loadTopComments();

    this.comments = new Comments({
        discussionId: this.getDiscussionId(),
        commentId: commentId ? commentId : null,
        order: this.getDiscussionClosed() ? 'oldest' : 'newest',
        state: 'partial'
    });

    this.comments.attachTo(commentsElem);

    this.comments.fetchComments({comment: commentId}).then(function() {
        $('.discussion .preload-msg').addClass('u-h');

        if (commentId || window.location.hash === '#comments') {
            this.comments.removeState('shut');
            this.comments.removeState('partial');
        }
        bonzo(commentsContainer).removeClass('modern-hidden');
        this.initUnthreaded();
        this.initShowAll();

        this.on('user:loaded', function() {
            this.initState();
            this.renderCommentBar();
            if (this.user) {
                this.comments.addUser(this.user);
            }
        });
        this.getUser();
    }.bind(this));

    this.checkCommentsLoaded();

    this.renderCommentCount();

    DiscussionAnalytics.init();

    bean.on(window, 'hashchange', function() {
        var commentId = this.getCommentIdFromHash();
        if (commentId) {
            this.comments.gotoComment(commentId);
        }
    }.bind(this));

    // More for analytics than anything
    if (window.location.hash === '#comments') {
        mediator.emit('discussion:seen:comments-anchor');
    }

    register.end('discussion');
};

Loader.prototype.initShowAll = function() {
    var $showAllBtn = $('.js-show-all'),
        offClass = 'discussion__show-all--off';

    if (userPrefs.get('discussion.expand')) {
        $showAllBtn.removeClass(offClass);
    }

    this.on('click', '.js-show-all', function(e) {
        var $btn = bonzo(e.currentTarget).toggleClass(offClass),
            expand = !$btn.hasClass(offClass);
        
        this.comments.options.expand = expand;
        userPrefs.set('discussion.expand', expand);
        this.comments.fetchComments();
    });
};

Loader.prototype.initUnthreaded = function() {
    if (userPrefs.get('discussion.unthreaded')) {
        this.setState('unthreaded');
    }

    this.on('click', '.js-show-threaded', function() {
        this.toggleState('unthreaded');
        var unthreaded = this.hasState('unthreaded');
        this.comments.options.unthreaded = unthreaded;
        userPrefs.set('discussion.unthreaded', unthreaded);
        this.comments.fetchComments();
    });
};

/** @return {Reqwest|null} */
Loader.prototype.getUser = function() {
    if (Id.getUserFromCookie()) {
        DiscussionApi.getUser().then(function(resp) {
            this.user = resp.userProfile;
            this.emit('user:loaded');
        }.bind(this));
    } else {
        this.emit('user:loaded');
    }
};

Loader.prototype.isCommentable = function() {
    // not readonly, not closed and user is signed in
    return !this.comments.isReadOnly() && !this.getDiscussionClosed() && Id.getUserFromCookie();
};

Loader.prototype.initState = function() {
    if (this.getDiscussionClosed()) {
        this.setState('closed');
    } else if (this.comments.isReadOnly()) {
        this.setState('readonly');
    } else if (Id.getUserFromCookie()) {
        if (this.user && this.user.privateFields && !this.user.privateFields.canPostComment) {
            this.setState('banned');
        } else {
            this.setState('open');
        }
    } else {
        this.setState('open');
    }
};

/**
 * If discussion is closed -> render closed
 * If not signed in -> render signin,
 * Else render comment box
 */
Loader.prototype.renderCommentBar = function() {
    if (this.isCommentable()) {
        this.renderCommentBox();
        this.comments.on('first-load', this.renderBottomCommentBox.bind(this));
        this.comments.on('first-load', this.cleanUpOnShowComments.bind(this));
    }
};

Loader.prototype.renderCommentBox = function() {
    this.commentBox = new CommentBox({
        discussionId: this.getDiscussionId(),
        premod: this.user.privateFields.isPremoderated
    });
    this.commentBox.render(this.getElem('commentBox'));
    this.commentBox.on('post:success', this.commentPosted.bind(this));
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
        if (this.$topCommentsContainer.html().length > 0) {
            this.comments.removeState('partial');
            this.comments.setState('shut');
        }
    } else {
        _.delay(this.checkCommentsLoaded.bind(this), 1000);
    }
};

return Loader;

}); //define
