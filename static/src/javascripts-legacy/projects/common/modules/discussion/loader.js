define([
    'bean',
    'bonzo',
    'qwery',
    'lib/$',
    'lib/raven',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lib/scroller',
    'lib/fastdom-promise',
    'lib/fetch-json',
    'common/modules/analytics/discussion',
    'common/modules/analytics/register',
    'common/modules/component',
    'common/modules/discussion/api',
    'common/modules/discussion/comment-box',
    'common/modules/discussion/comments',
    'common/modules/discussion/discussion-frontend',
    'common/modules/discussion/upvote',
    'common/modules/experiments/utils',
    'common/modules/identity/api',
    'common/modules/user-prefs',
    'lodash/objects/isNumber'
], function (
    bean,
    bonzo,
    qwery,
    $,
    raven,
    config,
    detect,
    mediator,
    scroller,
    fastdom,
    fetchJson,
    DiscussionAnalytics,
    register,
    Component,
    DiscussionApi,
    CommentBox,
    Comments,
    discussionFrontend,
    upvote,
    abUtils,
    Id,
    userPrefs,
    isNumber
) {

var Loader = function() {
    register.begin('discussion');
};
Component.define(Loader);

Loader.prototype.classes = { };

Loader.prototype.componentClass = 'discussion';
Loader.prototype.comments = null;
Loader.prototype.user = null;
Loader.prototype.username = null;

Loader.prototype.initTopComments = function() {

    this.on('click', '.js-jump-to-comment', function(e) {
        e.preventDefault();
        var commentId = bonzo(e.currentTarget).data('comment-id');
        this.gotoComment(commentId);
    });

    return fetchJson('/discussion/top-comments/' + this.getDiscussionId() + '.json?commentsClosed=' + this.getDiscussionClosed(), {
        mode: 'cors'
    }).then(
        function render(resp) {
            this.$topCommentsContainer.html(resp.html);
            this.topCommentCount = qwery('.d-top-comment', this.$topCommentsContainer[0]).length;
            if (this.topCommentCount !== 0) {
                $('.js-discussion-comment-box--bottom').removeClass('discussion__comment-box--bottom--hidden');
                this.setState('has-top-comments');
            }
        }.bind(this)
    ).catch(this.logError.bind(this, 'Top comments'));
};

Loader.prototype.initMainComments = function() {

    var self = this,
        commentId = this.getCommentIdFromHash();

    var order = userPrefs.get('discussion.order') || (this.getDiscussionClosed() ? 'oldest' : 'newest');
    var threading = userPrefs.get('discussion.threading') || 'collapsed';

    var defaultPagesize = detect.isBreakpoint({min: 'tablet'}) ?  25 : 10;

    this.comments = new Comments({
        discussionId: this.getDiscussionId(),
        order: order,
        pagesize: defaultPagesize,
        threading: threading
    });

    this.comments.attachTo(qwery('.js-discussion-main-comments')[0]);

    this.comments.on('untruncate-thread', this.removeTruncation.bind(this));

    this.on('click,', '.js-discussion-author-link', this.removeTruncation.bind(this));
    this.on('click', '.js-discussion-change-page, .js-discussion-show-button', function () {
        mediator.emit('discussion:comments:get-more-replies');
        self.removeTruncation();
    });


    this.comments.on('rendered', function(paginationHtml) {
        var newPagination = bonzo.create(paginationHtml),
            toolbarEl = qwery('.js-discussion-toolbar', this.elem)[0],
            container = $('.js-discussion-pagination', toolbarEl).empty();

        // When the pagesize is 'All', do not show any pagination.
        if (!this.comments.isAllPageSizeActive()) {
            container.html(newPagination);
        }
    }.bind(this));

    this.setState('loading');

    this.on('user:loaded', function() {
        this.initState();
        this.renderCommentBar();
        if (this.user) {
            this.comments.addUser(this.user);

            var userPageSize = userPrefs.get('discussion.pagesize'),
                pageSize = defaultPagesize;

            if (isNumber(userPageSize)) {
                pageSize = userPageSize;
            } else {
                if (userPageSize === 'All') {
                    pageSize = config.switches.discussionAllPageSize ? 'All' : 100;
                }
            }
            this.initPageSizeDropdown(pageSize);

            if (config.switches.discussionPageSize && detect.isBreakpoint({min: 'tablet'})) {
                this.comments.options.pagesize = pageSize;
            }

            if (this.user.isStaff) {
                this.removeState('not-staff');
                this.setState('is-staff');
            }
        }

        // Only truncate the loaded comments on this initial fetch,
        // and when no comment ID or #comments location is present.
        var shouldTruncate = !commentId && window.location.hash !== '#comments';

        this.loadComments({
            comment: commentId,
            shouldTruncate: shouldTruncate})
            .catch(this.logError.bind(this, 'Comments'));
    });
    this.getUser();
};

Loader.prototype.logError = function(commentType, error) {
    var reportMsg = commentType + ' failed to load: ',
        request = error.request || {};
    if (error.message === 'Request is aborted: timeout') {
        reportMsg += 'XHR timeout';
    } else if (error.message) {
        reportMsg += error.message;
    } else {
        reportMsg += 'status' in request ? request.status : '';
    }
    raven.captureMessage(reportMsg, {
        tags: {
            contentType: 'comments',
            discussionId: this.getDiscussionId(),
            status: 'status' in request ? request.status : '',
            readyState: 'readyState' in request ? request.readyState : '',
            response: 'response' in request ? request.response : '',
            statusText: 'status' in request ? request.statusText : ''
        }
    });
};

Loader.prototype.initPageSizeDropdown = function(pageSize) {

    var $pagesizeLabel = $('.js-comment-pagesize');
    $pagesizeLabel.text(pageSize);
    this.on('click', '.js-comment-pagesize-dropdown .popup__action', function(e) {
        bean.fire(qwery('.js-comment-pagesize-dropdown [data-toggle]')[0], 'click');
        var selectedPageSize = bonzo(e.currentTarget).data('pagesize');
        this.comments.options.pagesize = selectedPageSize;
        $pagesizeLabel.text(selectedPageSize);
        userPrefs.set('discussion.pagesize', selectedPageSize);
        this.loadComments({page: 1});
    });

};

Loader.prototype.initToolbar = function() {

    var $orderLabel = $('.js-comment-order');
    $orderLabel.text(this.comments.options.order);
    this.on('click', '.js-comment-order-dropdown .popup__action', function(e) {
        bean.fire(qwery('.js-comment-order-dropdown [data-toggle]')[0], 'click');
        this.comments.options.order = bonzo(e.currentTarget).data('order');
        $orderLabel.text(this.comments.options.order);
        userPrefs.set('discussion.order', this.comments.options.order);
        this.loadComments({page: 1});
    });

    var $threadingLabel = $('.js-comment-threading');
    $threadingLabel.text(this.comments.options.threading);
    this.on('click', '.js-comment-threading-dropdown .popup__action', function(e) {
        bean.fire(qwery('.js-comment-threading-dropdown [data-toggle]')[0], 'click');
        this.comments.options.threading = bonzo(e.currentTarget).data('threading');
        $threadingLabel.text(this.comments.options.threading);
        userPrefs.set('discussion.threading', this.comments.options.threading);
        this.loadComments();
    });

    if (config.page.section === 'crosswords') {
        var $timestampsLabel = $('.js-timestamps');
        var updateLabelText = function (prefValue) {
            $timestampsLabel.text(prefValue ? 'Relative' : 'Absolute');
        };
        updateLabelText(undefined);

        var PREF_RELATIVE_TIMESTAMPS = 'discussion.enableRelativeTimestamps';
        // Default to true
        var prefValue = userPrefs.get(PREF_RELATIVE_TIMESTAMPS) !== null
            ? userPrefs.get(PREF_RELATIVE_TIMESTAMPS)
            : true;
        updateLabelText(prefValue);

        this.on('click', '.js-timestamps-dropdown .popup__action', function(e) {
            bean.fire(qwery('.js-timestamps-dropdown [data-toggle]')[0], 'click');
            var format = bonzo(e.currentTarget).data('timestamp');
            var prefValue = format === 'relative';
            updateLabelText(prefValue);
            userPrefs.set(PREF_RELATIVE_TIMESTAMPS, prefValue);
            this.loadComments();
        });
    }
};

Loader.prototype.initRecommend = function() {
    this.on('click', '.js-recommend-comment', function(e) {
        upvote.handle(e.currentTarget, this.elem, this.user, DiscussionApi, config.switches.discussionAllowAnonymousRecommendsSwitch);
    });
    this.on('click', '.js-rec-tooltip-close', function() {
        upvote.closeTooltip();
    });
};

Loader.prototype.ready = function() {

    this.$topCommentsContainer = $('.js-discussion-top-comments');

    this.initTopComments();
    this.initMainComments();
    this.initToolbar();
    this.renderCommentCount();
    this.initPagination();
    this.initRecommend();

    DiscussionAnalytics.init();

    // More for analytics than anything
    if (window.location.hash === '#comments') {
        mediator.emit('discussion:seen:comments-anchor');
    } else if (this.getCommentIdFromHash()) {
        mediator.emit('discussion:seen:comment-permalink');
    }

    mediator.on('discussion:commentbox:post:success', this.removeState.bind(this, 'empty'));

    mediator.on('module:clickstream:click', function(clickspec) {
        if (
            clickspec &&
            'hash' in clickspec.target &&
            clickspec.target.hash === '#comments'
        ) {
            this.removeTruncation();
        }
    }.bind(this));

    register.end('discussion');
};

Loader.prototype.getUser = function() {
    var self = this;
    if (Id.getUserFromCookie()) {
        DiscussionApi.getUser().then(function(resp) {
            self.user = resp.userProfile;
            Id.getUserFromApiWithRefreshedCookie().then(function (response) {
                if (response.user.publicFields.username) {
                    self.username = response.user.publicFields.username;
                }
                self.emit('user:loaded');
            });
        }.bind(self));
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
        premod: this.user.privateFields.isPremoderated,
        newCommenter: !this.user.privateFields.hasCommented,
        hasUsername: this.username !== null,
        shouldRenderMainAvatar: false
    }).render(elem).on('post:success', this.commentPosted.bind(this));
};

Loader.prototype.getDiscussionId = function() {
    return this.elem.getAttribute('data-discussion-key');
};

Loader.prototype.getDiscussionClosed = function() {
    return this.elem.getAttribute('data-discussion-closed') === 'true';
};

Loader.prototype.renderCommentCount = function () {
    return discussionFrontend.load(this, {
        apiHost: config.page.discussionApiUrl,
        avatarImagesHost: config.page.avatarImagesUrl,
        closed: this.getDiscussionClosed(),
        discussionId: this.getDiscussionId(),
        element: document.getElementsByClassName('js-discussion-external-frontend')[0],
        userFromCookie: !!Id.getUserFromCookie(),
        profileUrl: config.page.idUrl,
        profileClientId: config.switches.registerWithPhone ? 'comments' : '',
        Promise: Promise
    });
};

Loader.prototype.getCommentIdFromHash = function() {
    var reg = (/#comment-(\d+)/);
    return reg.exec(window.location.hash) ? parseInt(reg.exec(window.location.hash)[1], 10) : null;
};

Loader.prototype.setCommentHash = function(id) {
    window.location.replace('#comment-' + id);
};

Loader.prototype.initPagination = function() {
    this.on('click', '.js-discussion-change-page', function(e) {
        e.preventDefault();
        var page = parseInt(e.currentTarget.getAttribute('data-page'), 10);
        this.setState('loading');
        this.gotoPage(page);
    });
};

Loader.prototype.gotoComment = function(id, fromRequest) {
    var comment = $('#comment-' + id, this.elem);
    var thisLoader = this;

    if (comment.length > 0) {
        var commentsAreHidden = $('.js-discussion-main-comments').css('display') === 'none';
        // If comments are hidden, lets show them
        if (commentsAreHidden) {
            fastdom.write(function(){
                thisLoader.comments.showHiddenComments();
                thisLoader.removeState('truncated');
                var $showAllButton = $('.d-discussion__show-all-comments');
                $showAllButton.length && $showAllButton.addClass('u-h');
            }).then(function(){
                thisLoader.setCommentHash(id);
            });
        } else {
            // If comments aren't hidden we can go straight to the comment
            thisLoader.setCommentHash(id);
        }
    } else if (!fromRequest) {
        // If the comment isn't on the page, then we need to load the comment thread
        thisLoader.loadComments({comment: id});
    } else {
        // The comment didn't exist in the response

        // Scroll to toolbar and show message
        scroller.scrollToElement(qwery('.js-discussion-toolbar'), 100);
        fastdom.write(function(){
            $('.js-discussion-main-comments').prepend('<div class="d-discussion__message d-discussion__message--error">The comment you requested could not be found.</div>');
        });

        // Capture in sentry
        raven.captureMessage('Comment doesn\'t exist in response', {
            level: 'error',
            extra: {
                commentId: id
            }
        });
    }
};

Loader.prototype.gotoPage = function(page) {
    scroller.scrollToElement(qwery('.js-discussion-toolbar'), 100);
    this.comments.relativeDates();
    this.loadComments({page: page});
};

Loader.prototype.loadComments = function(options) {

    this.setState('loading');

    options = options || {};

    // If the caller specified truncation, do not load all comments.
    if (options && options.shouldTruncate && this.comments.isAllPageSizeActive()) {
        options.pageSize = 10;
    }

    // Closed state of comments is passed so we bust cache of comment thread when it is reopened
    options.commentsClosed = this.getDiscussionClosed();

    return this.comments.fetchComments(options)
    .then(function(){
        this.removeState('loading');
        if (options && options.shouldTruncate) {
            this.setState('truncated');
        } else {
            // do not call removeTruncation because it could invoke another fetch.
            this.removeState('truncated');
        }
        if (this.comments.shouldShowPageSizeMessage()){
            this.setState('pagesize-msg-show');
        } else {
            this.removeState('pagesize-msg-show');
        }
        if (options.comment) {
            this.gotoComment(options.comment, true);
        }
    }.bind(this));
};

Loader.prototype.removeTruncation = function() {

    // When the pagesize is 'All', the full page is not yet loaded, so load the comments.
    if (this.comments.isAllPageSizeActive()) {
        this.loadComments();
    } else {
        this.removeState('truncated');
    }
};

return Loader;

}); //define
