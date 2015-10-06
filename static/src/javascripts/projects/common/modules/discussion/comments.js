define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/scroller',
    'common/modules/component',
    'common/modules/discussion/api',
    'common/modules/discussion/comment-box',
    'common/modules/discussion/whole-discussion',
    'common/modules/ui/relativedates',
    'common/modules/user-prefs',
    'common/views/svgs'
], function(
    bean,
    bonzo,
    qwery,
    $,
    ajaxPromise,
    config,
    mediator,
    scroller,
    Component,
    DiscussionApi,
    CommentBox,
    WholeDiscussion,
    relativedates,
    userPrefs,
    svgs
) {
'use strict';

var PREF_RELATIVE_TIMESTAMPS = 'discussion.enableRelativeTimestamps';
var shouldMakeTimestampsRelative = function () {
    // Default to true
    return userPrefs.get(PREF_RELATIVE_TIMESTAMPS) !== null
        ? userPrefs.get(PREF_RELATIVE_TIMESTAMPS)
        : true;
};

var Comments = function(options) {
    this.setOptions(options);
};

Component.define(Comments);

Comments.prototype.componentClass = 'd-comments';

Comments.prototype.classes = {
    comments: 'd-thread--top-level',
    topLevelComment: 'd-comment--top-level',
    reply: 'd-comment--response',
    showReplies: 'd-show-more-replies',
    showRepliesButton: 'd-show-more-replies__button',
    newComments: 'js-new-comments',

    comment: 'd-comment',
    commentReply: 'd-comment__action--reply',
    commentPick: 'd-comment__action--pick',
    commentStaff: 'd-comment--staff',
    commentBody: 'd-comment__body',
    commentTimestampJs: 'js-timestamp',
    commentReport: 'js-report-comment'
};

Comments.prototype.defaultOptions = {
    discussionId: null,
    showRepliesCount: 3,
    commentId: null,
    order: 'newest',
    threading: 'collapsed'
};

Comments.prototype.comments = null;
Comments.prototype.topLevelComments = null;
Comments.prototype.user = null;

Comments.prototype.ready = function() {

    this.topLevelComments = qwery(this.getClass('topLevelComment'), this.elem);
    this.comments = qwery(this.getClass('comment'), this.elem);

    this.on('click', this.getClass('showRepliesButton'), this.getMoreReplies);
    this.on('click', this.getClass('commentReport'), this.reportComment);

    if (shouldMakeTimestampsRelative()) {
        window.setInterval(
            function () {
                this.relativeDates();
            }.bind(this),
            60000
        );

        this.relativeDates();
    }

    this.emit('ready');

    this.on('click', '.js-report-comment-close', function() {
        $('.js-report-comment-form').addClass('u-h');
    });
};

Comments.prototype.handlePickClick = function(e) {
    e.preventDefault();
    var commentId = e.target.getAttribute('data-comment-id'),
        $thisButton = $(e.target),
        promise = $thisButton[0].getAttribute('data-comment-highlighted') === 'true' ? this.unPickComment.bind(this) : this.pickComment.bind(this);

    promise(commentId, $thisButton)
        .fail(function (resp) {
            var responseText = resp.response.length > 0 ? JSON.parse(resp.response).message : resp.statusText;
            $(e.target).text(responseText);
        });
};

Comments.prototype.pickComment = function(commentId, $thisButton) {
    var self = this,
        comment = qwery('#comment-' + commentId, this.elem);

    return DiscussionApi
        .pickComment(commentId)
        .then(function () {
            $(self.getClass('commentPick'), comment).removeClass('u-h');
            $thisButton.text('Unpick');
            comment.setAttribute('data-comment-highlighted', true);
        });
};

Comments.prototype.unPickComment = function(commentId, $thisButton) {
    var self = this,
        comment = qwery('#comment-' + commentId);

    return DiscussionApi
        .unPickComment(commentId)
        .then(function () {
            $(self.getClass('commentPick'), comment).addClass('u-h');
            $thisButton.text('Pick');
            comment.setAttribute('data-comment-highlighted', false);
        });
};

Comments.prototype.fetchComments = function(options) {
    options = options || {};

    var url = '/discussion/' +
        (options.comment ? 'comment-context/' + options.comment : this.options.discussionId) +
        '.json?' + (options.page ? '&page=' + options.page : '');

    var queryParams = {
        orderBy: options.order || this.options.order,
        pageSize: options.pagesize || this.options.pagesize,
        displayThreaded: this.options.threading !== 'unthreaded'
    };

    if (!options.comment && this.options.threading === 'collapsed') {
        queryParams.maxResponses = 3;
    }

    var promise,
        ajaxParams = {
            url: url,
            type: 'json',
            method: 'get',
            crossOrigin: true,
            data: queryParams
        };
    if (this.isAllPageSizeActive()) {
        promise = new WholeDiscussion({
            discussionId: this.options.discussionId,
            orderBy: queryParams.orderBy,
            displayThreaded: queryParams.displayThreaded,
            maxResponses: queryParams.maxResponses
        }).loadAllComments().catch(function() {
            this.wholeDiscussionErrors = true;
            queryParams.pageSize = 100;
            return ajaxPromise(ajaxParams);
            }.bind(this));
    } else {
        // It is possible that the user has chosen to view all comments,
        // but the WholeDiscussion module has failed. Fall back to 100 comments.
        if (queryParams.pageSize === 'All') {
            queryParams.pageSize = 100;
        }
        promise = ajaxPromise(ajaxParams);
    }
    return promise.then(this.renderComments.bind(this)).then(this.goToPermalink.bind(this, options.comment));
};

Comments.prototype.goToPermalink = function(commentId) {
    if (commentId) {
        this.showHiddenComments();
        $('.d-discussion__show-all-comments').addClass('u-h');
        window.location.replace('#comment-' + commentId);
    }
};

Comments.prototype.renderComments = function(resp) {

    // The resp object received has a collection of rendered html fragments, ready for DOM insertion.
    // - commentsHtml - the main comments content.
    // - paginationHtml - the discussion's pagination based on user page size and number of comments.
    // - postedCommentHtml - an empty comment for when the user successfully posts a comment.

    var contentEl = bonzo.create(resp.commentsHtml),
        comments = qwery(this.getClass('comment'), contentEl);

    bonzo(this.elem).empty().append(contentEl);
    this.addMoreRepliesButtons(comments);

    this.postedCommentEl = resp.postedCommentHtml;

    if (shouldMakeTimestampsRelative()) {
        this.relativeDates();
    }
    this.emit('rendered', resp.paginationHtml);

    mediator.emit('modules:comments:renderComments:rendered');
};

Comments.prototype.showHiddenComments = function(e) {
    if (e) { e.preventDefault(); }
    this.emit('first-load');
    if (shouldMakeTimestampsRelative()) {
        this.relativeDates();
    }
};

Comments.prototype.addMoreRepliesButtons = function (comments) {

    comments = comments || this.topLevelComments;
    comments.forEach(function(elem) {
        var replies = parseInt(elem.getAttribute('data-comment-replies'), 10),
            renderedReplies = qwery(this.getClass('reply'), elem);

        if (renderedReplies.length < replies) {
            var numHiddenReplies = replies - renderedReplies.length,

                $btn = $.create(
                    '<button class="u-button-reset button button--show-more button--small button--tone-news d-show-more-replies__button">' +
                        svgs('plus', ['icon']) +
                        'Show ' + numHiddenReplies + ' more ' + (numHiddenReplies === 1 ? 'reply' : 'replies') +
                    '</button>').attr({
                        'data-link-name': 'Show more replies',
                        'data-is-ajax': '',
                        'data-comment-id': elem.getAttribute('data-comment-id')
                    }).data('source-comment', elem);

                $.create('<li class="' + this.getClass('showReplies', true) + '"></li>')
                       .append($btn).appendTo($('.d-thread--responses', elem));

        }
    }.bind(this));
};

Comments.prototype.getMoreReplies = function(event) {
    event.preventDefault();

    var li = $.ancestor(event.currentTarget, this.getClass('showReplies').slice(1));
    li.innerHTML = 'Loading…';

    var source = bonzo(event.target).data('source-comment');

    ajaxPromise({
        url: '/discussion/comment/' + event.currentTarget.getAttribute('data-comment-id') + '.json',
        type: 'json',
        method: 'get',
        data: {displayThreaded: true},
        crossOrigin: true
    }).then(function (resp) {
        var comment = bonzo.create(resp.html),
            replies = qwery(this.getClass('reply'), comment);

        replies = replies.slice(this.options.showRepliesCount);
        bonzo(qwery('.d-thread--responses', source)).append(replies);
        bonzo(li).addClass('u-h');
        this.emit('untruncate-thread');

        if (shouldMakeTimestampsRelative()) {
            this.relativeDates();
        }
    }.bind(this));
};

Comments.prototype.isReadOnly = function() {
    return this.elem.getAttribute('data-read-only') === 'true';
};

/**
 * @param {object.<string.*>} comment
 * @param {Boolean=} focus (optional)
 * @param {Element=} parent (optional)
 */
Comments.prototype.addComment = function(comment, focus, parent) {
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
            body: '<p>' + comment.body.replace(/\n+/g, '</p><p>') + '</p>',
            report: {
                href: 'http://discussion.theguardian.com/components/report-abuse/' + comment.id
            },
            avatar: {
                src: this.user.avatar
            }
        },
        commentElem = bonzo.create(this.postedCommentEl)[0],
        $commentElem = bonzo(commentElem);

    $commentElem.addClass('d-comment--new');

    for (key in map) {
        if (map.hasOwnProperty(key)) {
            selector = map[key];
            val = values[key];
            elem = qwery('.' + selector, commentElem)[0];
            if (typeof val === 'string') {
                elem.innerHTML = val;
            } else {
                for (attr in val) {
                    elem.setAttribute(attr, val[attr]);
                }
            }
        }
    }
    commentElem.id = 'comment-' + comment.id;

    if (this.user && !this.user.isStaff) {
        $commentElem.addClass(this.getClass('commentStaff', true));
    }

    // Stupid hack. Will rearchitect.
    if (!parent) {
        $(this.getClass('newComments'), this.elem).prepend(commentElem);
    } else {
        $commentElem.removeClass(this.getClass('topLevelComment', true));
        $commentElem.addClass(this.getClass('reply', true));
        bonzo(parent).append($commentElem);
    }

    window.location.replace('#comment-' + comment.id);
};

Comments.prototype.replyToComment = function(e) {
    e.preventDefault(); // stop the anchor link firing

    var parentCommentEl, showRepliesElem,
        replyLink = e.currentTarget,
        replyToId = replyLink.getAttribute('data-comment-id'),
        self = this;

    // There is already a comment box for this on the page
    if (document.getElementById('reply-to-' + replyToId)) {
        document.getElementById('reply-to-' + replyToId).focus();
        return;
    }

    $('.d-comment-box--response').remove();

    var replyToComment = qwery('#comment-' + replyToId)[0],
        replyToAuthor = replyToComment.getAttribute('data-comment-author'),
        replyToAuthorId = replyToComment.getAttribute('data-comment-author-id'),
        $replyToComment = bonzo(replyToComment),
        replyToBody = qwery(this.getClass('commentBody'), replyToComment)[0].innerHTML,
        replyToTimestamp = qwery(this.getClass('commentTimestampJs'), replyToComment)[0].innerHTML,
        commentBox = new CommentBox({
            discussionId: this.options.discussionId,
            premod: this.user.privateFields.isPremoderated,
            state: 'response',
            replyTo: {
                commentId: replyToId,
                author: replyToAuthor,
                authorId: replyToAuthorId,
                body: replyToBody,
                timestamp: replyToTimestamp
            },
            focus: true
        });

    // this is a bit toffee, but we don't have .parents() in bonzo
    parentCommentEl = $replyToComment.hasClass(this.getClass('topLevelComment', true)) ? $replyToComment[0] : $replyToComment.parent().parent()[0];

    // I don't like this, but UX says go
    showRepliesElem = qwery(this.getClass('showReplies'), parentCommentEl);
    if (showRepliesElem.length > 0 && !bonzo(showRepliesElem).hasClass('u-h')) {
        showRepliesElem[0].click();
    }
    commentBox.render(parentCommentEl);

    // TODO (jamesgorrie): Remove Hack hack hack
    commentBox.on('post:success', function(comment) {
        var responses = qwery('.d-thread--responses', parentCommentEl)[0];
        if (!responses) {
            responses = bonzo.create('<ul class="d-thread d-thread--responses"></ul>')[0];
            bonzo(parentCommentEl).append(responses);
        }
        this.destroy();
        self.addComment(comment, false, responses);
    });
};

Comments.prototype.reportComment = function(e) {
    e.preventDefault();

    var commentId = e.currentTarget.getAttribute('data-comment-id');

    $('.js-report-comment-form').first().each(function(form) {
        bean.one(form, 'submit', function(e) {
            e.preventDefault();
            var category = form.elements.category,
                comment = form.elements.comment.value;

            if (category.value !== '0') {
                DiscussionApi.reportComment(commentId, {
                    emailAddress: form.elements.email.value,
                    categoryId: category.value,
                    reason: comment
                });
            }

            bonzo(form).addClass('u-h');
        });
    }).appendTo(
        $('#comment-' + commentId + ' .js-report-comment-container').first()
    ).removeClass('u-h');
};

Comments.prototype.addUser = function(user) {
    this.user = user;

    // Determine user staff status
    if (this.user && this.user.badge) {
        this.user.isStaff = this.user.badge.some(function (e) { // Returns true if any element in array satisfies function
            return e.name === 'Staff';
        });
    }

    if (!this.isReadOnly()) {

        if (this.user && this.user.privateFields.canPostComment) {

            $(this.getClass('commentReply')).attr('href', '#'); // remove sign-in link

            this.on('click', this.getClass('commentReply'), this.replyToComment);
            this.on('click', this.getClass('commentPick'), this.handlePickClick);
        }
    }
};

Comments.prototype.relativeDates = function() {
    if (shouldMakeTimestampsRelative()) {
        relativedates.init();
    }
};

Comments.prototype.isAllPageSizeActive = function() {
    return config.switches.discussionAllPageSize &&
    this.options.pagesize === 'All' &&
    !this.wholeDiscussionErrors;
};

Comments.prototype.shouldShowPageSizeMessage = function() {
    // Similar to above, but tells the loader that the fallback size should be used.
    return config.switches.discussionAllPageSize &&
    this.options.pagesize === 'All' &&
    this.wholeDiscussionErrors;
};

return Comments;
});
