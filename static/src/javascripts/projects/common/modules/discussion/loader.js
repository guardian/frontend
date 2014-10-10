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
    'common/modules/discussion/api',
    'common/modules/discussion/comment-box',
    'common/modules/discussion/comments',
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
    DiscussionApi,
    CommentBox,
    Comments,
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
    comments: 'discussion__comments'
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
            this.topCommentCount = qwery('.d-top-comment', this.$topCommentsContainer[0]).length;
            if (this.topCommentCount !== 0) {
                this.setState('has-top-comments');
            }
        }.bind(this),
        function () {
        }
    );
};


Loader.prototype.ready = function() {

    this.$topCommentsContainer = $('.js-discussion-top-comments');
    this.toolbarEl = qwery('.js-discussion-toolbar', this.el)[0];

    this.on('click', '.js-discussion-show-button', function() {
        this.removeState('truncated');
    }.bind(this));

    var commentId = this.getCommentIdFromHash();

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

    this.comments.attachTo(qwery('.js-discussion-main-comments')[0]);

    this.comments.on('rendered', function(e) {
        var newPagination = $('.js-discussion-pagination', this.comments.elem).html();
        $('.js-discussion-pagination', this.toolbarEl).empty().html(newPagination);
    }.bind(this));

    this.comments.fetchComments({comment: commentId}).then(function() {
        $('.discussion .preload-msg').addClass('u-h');

        if (!commentId && window.location.hash !== '#comments') {
            this.setState('truncated');
        }

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

    this.initPagination();

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

    mediator.on('module:clickstream:click', this.handleBodyClick.bind(this));

    register.end('discussion');
};

Loader.prototype.handleBodyClick = function(clickspec) {
    if ('hash' in clickspec.target && clickspec.target.hash === '#comments') {
        this.removeState('first-two-comments-only');
        this.removeState('show-top-comments-only');
    }
};

Loader.prototype.initShowAll = function() {
    var $showAllBtn = $('.js-show-all'),
        offClass = 'discussion__show-all--off';

    if (userPrefs.get('discussion.expand')) {
        $showAllBtn.removeClass(offClass);
    }

    this.on('click', '.js-untruncate-main-comments', function(e) {
        this.removeState('first-two-comments-only');
    });

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

Loader.prototype.renderCommentBar = function() {
    if (this.isCommentable()) {
        this.renderCommentBox(qwery('.js-discussion-comment-box--top')[0]);
        this.comments.on('first-load', this.renderCommentBox.bind(this, qwery('.js-discussion-comment-box--bottom')[0]));
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

Loader.prototype.renderCommentBox = function(elem) {
    return new CommentBox({
        discussionId: this.getDiscussionId(),
        premod: this.user.privateFields.isPremoderated
    }).render(elem).on('post:success', this.commentPosted.bind(this));
};

Loader.prototype.getDiscussionId = function() {
    return this.elem.getAttribute('data-discussion-key');
};

Loader.prototype.getDiscussionClosed = function() {
    return this.elem.getAttribute('data-discussion-closed') === 'true';
};

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
                } else {
                    this.setState('empty');
                }
            }
        }.bind(this)
    });
};

Loader.prototype.getCommentIdFromHash = function() {
    var reg = (/#comment-(\d+)/);
    return reg.exec(window.location.hash) ? parseInt(reg.exec(window.location.hash)[1], 10) : null;
};

Loader.prototype.checkCount = 0;

Loader.prototype.initPagination = function() {
    this.on('click', '.js-discussion-change-page', function(e) {
        e.preventDefault();
        var page = parseInt(e.currentTarget.getAttribute('data-page'), 10);
        return this.comments.gotoPage(page);
    });
};

Loader.prototype.checkCommentsLoaded = function() {

    // Limit the number of tries.
    if (++this.checkCount > 10 ) {
        return;
    }

    if (this.topCommentCount !== undefined && this.comments.rendered) {
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
