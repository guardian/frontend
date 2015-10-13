define([
    'bean',
    'bonzo',
    'qwery',
    'raven',

    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/scroller',

    'common/modules/analytics/discussion',
    'common/modules/analytics/register',
    'common/modules/component',
    'common/modules/discussion/api',
    'common/modules/discussion/comment-box',
    'common/modules/discussion/comments',
    'common/modules/identity/api',
    'common/modules/user-prefs'
], function(
    bean,
    bonzo,
    qwery,
    raven,
    $,
    _,
    ajaxPromise,
    config,
    detect,
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
        scroller.scrollToElement(qwery('.js-discussion-toolbar'), 100);
        var commentId = bonzo(e.currentTarget).data('comment-id');
        this.loadComments({comment: commentId});
    });

    return ajaxPromise({
        url: '/discussion/top-comments/' + this.getDiscussionId() + '.json',
        type: 'json',
        method: 'get',
        crossOrigin: true
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

    console.log("++ Init main comments");
    var commentId = this.getCommentIdFromHash();

    if (commentId) {
        mediator.emit('discussion:seen:comment-permalink');
    }

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

    this.on('click', '.js-discussion-show-button, .d-show-more-replies__button, .js-discussion-author-link, .js-discussion-change-page',
        this.removeTruncation.bind(this));

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
        console.log("++ On user toaded");
        this.initState();
        this.renderCommentBar();
        if (this.user) {
            this.comments.addUser(this.user);

            var userPageSize = userPrefs.get('discussion.pagesize'),
                pageSize = defaultPagesize;

            if (_.isNumber(userPageSize)) {
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
            .catch(function(error) {
                var reportMsg = 'Comments failed to load: ',
                    request = error.request;
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
            }.bind(this));
    });
    this.getUser();
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
        updateLabelText(prefValue);

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
            this.gotoComment(commentId);
        }
    }.bind(this));

    // More for analytics than anything
    if (window.location.hash === '#comments') {
        mediator.emit('discussion:seen:comments-anchor');
    }

    mediator.on('discussion:commentbox:post:success', this.removeState.bind(this, 'empty'));

    mediator.on('module:clickstream:click', function(clickspec) {
        if ('hash' in clickspec.target && clickspec.target.hash === '#comments') {
            this.removeTruncation();
        }
    }.bind(this));

    register.end('discussion');
};

Loader.prototype.getUser = function() {
    console.log("++ Get user");
    if (Id.getUserFromCookie()) {
        //console.log("Get user!");
        DiscussionApi.getUser().then(function(resp) {
            this.user = resp.userProfile;
            this.emit('user:loaded');
        }.bind(this));
    } else {
        this.emit('user:loaded');
    }
};

Loader.prototype.isCommentable = function() {
    var userCanPost = this.user && this.user.privateFields && this.user.privateFields.canPostComment;
    // not readonly, not closed and user is signed in
    //console.log("+++ Can I comment, oh yeah baby " + userCanPost + " is Not Read Only" +  !this.comments.isReadOnly() + " is open: " + !this.getDiscussionClosed());
    //return userCanPost && !this.comments.isReadOnly() && !this.getDiscussionClosed();
    return true;
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
    console.log("++ Render Comment box 2")
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
    ajaxPromise({
        url: '/discussion/comment-counts.json?shortUrls=' + this.getDiscussionId(),
        type: 'json',
        method: 'get',
        crossOrigin: true,
        success: function(response) {
            if(response && response.counts && response.counts.length) {
                var commentCount = response.counts[0].count;
                if (commentCount > 0) {
                    // Remove non-JS links
                    bonzo(qwery('.js-show-discussion, .js-show-discussion a')).attr('href', '#comments');

                    var commentCountLabel = (commentCount === 1) ? 'comment' : 'comments',
                        html = '<a href="#comments" class="js-show-discussion commentcount tone-colour" data-link-name="Comment count">' +
                               '  <i class="i"></i>' + commentCount +
                               '  <span class="commentcount__label">' + commentCountLabel + '</span>' +
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
        this.gotoPage(page);
    });
};

Loader.prototype.gotoComment = function(id) {
    var comment = $('#comment-' + id, this.elem);

    if (comment.length > 0) {
        window.location.replace('#comment-' + id);
        return;
    }

    this.loadComments({comment: id}).then(function() {
        window.location.replace('#comment-' + id);
    });
};

Loader.prototype.gotoPage = function(page) {
    scroller.scrollToElement(qwery('.js-discussion-toolbar'), 100);
    this.comments.relativeDates();
    this.loadComments({page: page});
};

Loader.prototype.loadComments = function(options) {

    this.setState('loading');

    // If the caller specified truncation, do not load all comments.
    if (options && options.shouldTruncate && this.comments.isAllPageSizeActive()) {
        options.pageSize = 10;
    }

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
