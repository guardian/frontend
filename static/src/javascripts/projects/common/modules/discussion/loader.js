define([
    'bean',
    'bonzo',
    'qwery',

    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/scroller',

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
    scroller,
    DiscussionAnalytics,
    register,
    Component,
    DiscussionApi,
    CommentBox,
    Comments,
    Id,
    userPrefs
) {

var Loader = function() {
    register.begin('discussion');
};
Component.define(Loader);

Loader.prototype.classes = { };

Loader.prototype.componentClass = 'discussion';
Loader.prototype.comments = null;
Loader.prototype.user = null;

Loader.prototype.initTopComments = function() {

    this.on('click', '.js-jump-to-comment', function(e) {
        e.preventDefault();
        this.removeState('truncated');
        this.setState('loading');
        scroller.scrollToElement(qwery('.js-discussion-toolbar'), 100);
        var commentId = bonzo(e.currentTarget).data('comment-id');
        this.comments.fetchComments({comment: commentId}).then(this.removeState.bind(this, 'loading'));
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
        }.bind(this)
    );
};

Loader.prototype.initMainComments = function() {

    var commentId = this.getCommentIdFromHash();

    if (commentId) {
        mediator.emit('discussion:seen:comment-permalink');
    }

    var order = userPrefs.get('discussion.order') || (this.getDiscussionClosed() ? 'oldest' : 'newest');
    var threading = userPrefs.get('discussion.threading') || 'collapsed';

    this.comments = new Comments({
        discussionId: this.getDiscussionId(),
        order: order,
        threading: threading
    });

    this.comments.attachTo(qwery('.js-discussion-main-comments')[0]);

    this.comments.on('untruncate-thread', function() {
        this.removeState('truncated');
    }.bind(this));

    this.comments.on('rendered', function() {
        var newPagination = $('.js-discussion-pagination', this.comments.elem).html();
        $('.js-discussion-pagination', this.toolbarEl).empty().html(newPagination);
    }.bind(this));

    this.setState('loading');
    this.comments.fetchComments({comment: commentId}).then(function() {
        this.removeState('loading');

        if (!commentId && window.location.hash !== '#comments') {
            this.setState('truncated');
        }

        this.on('user:loaded', function() {
            this.initState();
            this.renderCommentBar();
            if (this.user) {
                this.comments.addUser(this.user);
                if (this.user.isStaff) {
                    this.removeState('not-staff');
                    this.setState('is-staff');
                }
            }
        });
        this.getUser();
    }.bind(this));
};


Loader.prototype.initToolbar = function() {

    var $orderLabel = $('.js-comment-order-dropdown .popup__toggle span');
    $orderLabel.text(this.comments.options.order);
    this.on('click', '.js-comment-order-dropdown .popup__action', function(e) {
        this.removeState('truncated');
        bean.fire(qwery('.js-comment-order-dropdown [data-toggle]')[0], 'click');
        this.comments.options.order = bonzo(e.currentTarget).data('order');
        $orderLabel.text(this.comments.options.order);
        userPrefs.set('discussion.order', this.comments.options.order);
        this.setState('loading');
        this.comments.fetchComments({page: 1}).then(this.removeState.bind(this, 'loading'));
    });

    var $threadingLabel = $('.js-comment-threading-dropdown .popup__toggle span');
    $threadingLabel.text(this.comments.options.threading);
    this.on('click', '.js-comment-threading-dropdown .popup__action', function(e) {
        this.removeState('truncated');
        bean.fire(qwery('.js-comment-threading-dropdown [data-toggle]')[0], 'click');
        this.comments.options.threading = bonzo(e.currentTarget).data('threading');
        $threadingLabel.text(this.comments.options.threading);
        userPrefs.set('discussion.threading', this.comments.options.threading);
        this.setState('loading');
        this.comments.fetchComments().then(this.removeState.bind(this, 'loading'));
    });
};

Loader.prototype.isOpenForRecommendations = function() {
    return qwery('.d-discussion--recommendations-open', this.elem).length !== 0;
};

Loader.prototype.initRecommend = function() {
    this.on('click', '.js-recommend-comment', function(e) {
        if (this.user && this.isOpenForRecommendations()) {
            var elem = e.currentTarget,
                $el = bonzo(elem);

            $el.removeClass('js-recommend-comment');

            var id = elem.getAttribute('data-comment-id'),
                result = DiscussionApi.recommendComment(id);

            $el.addClass('d-comment__recommend--clicked');
            return result.then(
                $el.addClass.bind($el, 'd-comment__recommend--recommended')
            );
        }
    });
};

Loader.prototype.ready = function() {

    this.$topCommentsContainer = $('.js-discussion-top-comments');
    this.toolbarEl = qwery('.js-discussion-toolbar', this.el)[0];

    this.on('click', '.js-discussion-show-button, .d-show-more-replies__button', function() {
        this.removeState('truncated');
    });

    this.initTopComments();
    this.initMainComments();
    this.initToolbar();
    this.renderCommentCount();
    this.initPagination();
    this.initRecommend();

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

    mediator.on('discussion:commentbox:post:success', this.removeState.bind(this, 'empty'));

    mediator.on('module:clickstream:click', function(clickspec) {
        if ('hash' in clickspec.target && clickspec.target.hash === '#comments') {
            this.removeState('truncated');
        }
    }.bind(this));

    register.end('discussion');
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
    var userCanPost = this.user && this.user.privateFields && this.user.privateFields.canPostComment;
    return userCanPost && !this.comments.isReadOnly() && !this.getDiscussionClosed();
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
        this.renderCommentBox(qwery('.js-discussion-comment-box--bottom')[0]);
    }
};

Loader.prototype.commentPosted = function () {
    this.removeState('truncated');
    this.comments.addComment.apply(this.comments, arguments);
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
                    $('.js-comment-count').html(html);

                    $('.js-discussion-comment-count').text('(' + commentCount + ')');
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

Loader.prototype.initPagination = function() {
    this.on('click', '.js-discussion-change-page', function(e) {
        e.preventDefault();
        var page = parseInt(e.currentTarget.getAttribute('data-page'), 10);
        this.setState('loading');
        return this.comments.gotoPage(page).then(this.removeState.bind(this, 'loading'));
    });
};



return Loader;

}); //define
