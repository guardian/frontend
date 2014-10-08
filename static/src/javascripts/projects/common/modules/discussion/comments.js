define([
    'bean',
    'bonzo',
    'qwery',

    'lodash/collections/map',

    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/scroller',

    'common/modules/component',
    'common/modules/discussion/api',
    'common/modules/discussion/comment-box',
    'common/modules/discussion/recommend-comments',
    'common/modules/identity/api',
    'common/modules/ui/relativedates',
    'common/modules/userPrefs'
], function(
    bean,
    bonzo,
    qwery,
    
    _map,

    $,
    ajax,
    detect,
    mediator,
    scroller,

    Component,
    DiscussionApi,
    CommentBox,
    RecommendComments,
    Id,
    relativedates,
    userPrefs
) {
'use strict';

var Comments = function(options) {
    this.setOptions(options);
    this.options.order = userPrefs.get('discussion.order') || 'newest';
    this.options.expand = userPrefs.get('discussion.expand') || false;
};

Component.define(Comments);

Comments.prototype.componentClass = 'd-discussion';

Comments.prototype.classes = {

    jsContent: 'js-discussion-content',
    container: 'discussion__comments__container',
    comments: 'd-thread--top-level',
    topLevelComment: 'd-comment--top-level',
    changePage: 'js-discussion-change-page',
    showMoreHiddenContainer: 'show-more__container--hidden',
    showMoreNewer: 'd-discussion__show-more--newer',
    showMoreOlder: 'd-discussion__show-more--older',
    showMoreLoading: 'd-discussion__show-more-loading',
    showHidden:      'd-discussion__show-all-comments',
    reply: 'd-comment--response',
    showReplies: 'd-show-more-replies',
    showRepliesButton: 'd-show-more-replies__button',
    heading: 'discussion__heading',
    newComments: 'js-new-comments',
    orderControl: 'd-discussion__order-control',
    loader: 'd-discussion__loader',

    comment: 'd-comment',
    commentActions: 'd-comment__actions__main',
    commentReply: 'd-comment__action--reply',
    commentPick: 'd-comment__action--pick',
    commentRecommend: 'd-comment__recommend',
    commentStaff: 'd-comment--staff',
    commentBlocked: 'd-comment--blocked',
    commentBody: 'd-comment__body',
    commentTimestampJs: 'js-timestamp',
    commentReport: 'js-report-comment'
};

Comments.prototype.defaultOptions = {
    discussionId: null,
    showRepliesCount: 3,
    commentId: null,
    order: 'newest',
    state: null
};

Comments.prototype.comments = null;
Comments.prototype.topLevelComments = null;
Comments.prototype.user = null;

Comments.prototype.ready = function() {

    this.topLevelComments = qwery(this.getClass('topLevelComment'), this.elem);
    this.comments = qwery(this.getClass('comment'), this.elem);

    if (this.options.state) {
        this.setState(this.options.state);
    }

    this.on('click', this.getClass('showRepliesButton'), this.getMoreReplies);
    this.on('click', this.getClass('changePage'), this.changePage);
    this.on('click', this.getClass('showHidden'), this.showHiddenComments);
    this.on('click', this.getClass('commentReport'), this.reportComment);
    this.on('change', this.getClass('orderControl'), this.setOrder);

    window.setInterval(
        function () {
            this.relativeDates();
        }.bind(this),
        60000
    );

    this.addMoreRepliesButtons();

    if (this.options.commentId) {
        var comment = $('#comment-'+ this.options.commentId);
        this.showHiddenComments();
        $('.d-discussion__show-all-comments').addClass('u-h');
        if (comment.attr('hidden')) {
            bean.fire($(this.getClass('showReplies'), comment.parent())[0], 'click');
        }

        window.location.replace('#comment-'+ this.options.commentId);
    }

    this.emit('ready');
    this.relativeDates();

    $('.js-report-comment-close', this.elem).each(function(close) {
        bean.on(close, 'click', function() {
            $('.js-report-comment-form').addClass('u-h');
        });
    });

    mediator.on('module:clickstream:click', this.handleBodyClick.bind(this));
};

Comments.prototype.handleBodyClick = function(clickspec) {
    if ('hash' in clickspec.target && clickspec.target.hash === '#comments') {
        this.showHiddenComments();
    }
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
        comment = qwery('#comment-'+ commentId, this.elem);

    return DiscussionApi
        .pickComment(commentId)
        .then(function () {
            $(self.getClass('commentPick'), comment).removeClass('u-h');
            $(self.getClass('commentRecommend'), comment).addClass('d-comment__recommend--left');
            $thisButton.text('Unpick');
            comment.setAttribute('data-comment-highlighted', true);
        });
};

Comments.prototype.unPickComment = function(commentId, $thisButton) {
    var self = this,
        comment = qwery('#comment-'+ commentId);

    return DiscussionApi
        .unPickComment(commentId)
        .then(function () {
            $(self.getClass('commentPick'), comment).addClass('u-h');
            $(self.getClass('commentRecommend'), comment).removeClass('d-comment__recommend--left');
            $thisButton.text('Pick');
            comment.setAttribute('data-comment-highlighted', false);
        });
};

Comments.prototype.gotoComment = function(id) {
    var comment = $('#comment-'+ id, this.elem);

    if (comment.length > 0) {
        window.location.replace('#comment-'+ id);
        return;
    }

    return this.fetchComments({
        comment: id
    }).then(function() {
        window.location.replace('#comment-'+ id);
    }.bind(this));
};

Comments.prototype.gotoPage = function(page) {
    this.loading();
    scroller.scrollToElement(qwery('.discussion__comments__container .discussion__heading'), 100);
    this.relativeDates();
    return this.fetchComments({
        page: page
    }).then(function() {
        this.loaded();
    }.bind(this));
};

Comments.prototype.changePage = function(e) {
    e.preventDefault();
    var page = parseInt(e.currentTarget.getAttribute('data-page'), 10);
    this.relativeDates();
    return this.gotoPage(page);
};

Comments.prototype.fetchComments = function(options) {
    options = options || {};

    var url = '/discussion/'+
        (options.comment ? 'comment-context/'+ options.comment : this.options.discussionId)+
        '.json?'+ (options.page ? '&page=' + options.page : '');

    var queryParams = {
        orderBy: options.order || this.options.order,
        pageSize: detect.isBreakpoint({min: 'desktop'}) ? 25 : 10
    };
    if (this.options.expand) {
        queryParams.maxResponses = 3;
    }

    return ajax({
        url: url,
        type: 'json',
        method: 'get',
        crossOrigin: true,
        data: queryParams
    }).then(this.renderComments.bind(this));
};

Comments.prototype.renderComments = function(resp) {

    var contentEl = bonzo.create(resp.html),
        comments = qwery(this.getClass('comment'), contentEl);

    bonzo(this.elem).empty().append(contentEl);
    this.addMoreRepliesButtons(comments);

    if (!this.isReadOnly()) {
        RecommendComments.initButtons($(this.getClass('commentRecommend'), this.elem));
    }

    this.relativeDates();
    this.emit('loaded');
};

Comments.prototype.showHiddenComments = function(e) {
    if (e) { e.preventDefault(); }
    this.removeState('shut');
    this.removeState('partial');
    this.emit('first-load');
    this.relativeDates();
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
                        '<i class="i i-plus-blue"></i>' +
                        'Show '+ numHiddenReplies +' more '+ (numHiddenReplies === 1 ? 'reply' : 'replies')+
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

    var self = this,
        source = bonzo(event.target).data('source-comment');

    ajax({
        url: '/discussion/comment/'+ event.currentTarget.getAttribute('data-comment-id') +'.json',
        type: 'json',
        method: 'get',
        data: {displayThreaded: true},
        crossOrigin: true
    }).then(function (resp) {
        var comment = bonzo.create(resp.html),
            replies = qwery(self.getClass('reply'), comment);

        replies = replies.slice(self.options.showRepliesCount);
        bonzo(qwery('.d-thread--responses', source)).append(replies);
        bonzo(li).addClass('u-h');

        if (!self.isReadOnly()) {
            var btns = _map(replies, function(reply) {
                return qwery(self.getClass('commentRecommend'), reply)[0];
            });
            RecommendComments.initButtons(btns);
        }
        self.relativeDates();
    });
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
            body: '<p>'+ comment.body.replace(/\n+/g, '</p><p>') +'</p>',
            report: {
                href: 'http://discussion.theguardian.com/components/report-abuse/'+ comment.id
            },
            avatar: {
                src: this.user.avatar
            }
        },
        commentElem = bonzo.create(document.getElementById('tmpl-comment').innerHTML)[0],
        $commentElem = bonzo(commentElem);

    $commentElem.addClass('d-comment--new');

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

    window.location.replace('#comment-'+ comment.id);
};

Comments.prototype.replyToComment = function(e) {
    e.preventDefault(); // stop the anchor link firing

    var parentCommentEl, showRepliesElem,
        replyLink = e.currentTarget,
        replyToId = replyLink.getAttribute('data-comment-id'),
        self = this;

    // There is already a comment box for this on the page
    if (document.getElementById('reply-to-'+ replyToId)) {
        document.getElementById('reply-to-'+ replyToId).focus();
        return;
    }

    $('.d-comment-box--response').remove();

    var replyToComment = qwery('#comment-'+ replyToId)[0],
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

Comments.prototype.showDiscussion = function() {
    var showDiscussionElem = $('.d-discussion__show-all-comments');
    if (!showDiscussionElem.hasClass('u-h')) {
        bean.fire(showDiscussionElem, 'click');
        showDiscussionElem.addClass('u-h');
    }
    this.relativeDates();
};

Comments.prototype.loading = function() {
    var $content = $(this.getClass('jsContent'), this.elem);
    $(this.getClass('loader'), this.elem).removeClass('u-h').css({
        height: $content.offset().height
    });
    $content.addClass('u-h');
};

Comments.prototype.loaded = function() {
    var $content = $(this.getClass('jsContent'), this.elem);
    $(this.getClass('loader'), this.elem).addClass('u-h').css({
        height: 'auto'
    });
    $content.removeClass('u-h');
};

Comments.prototype.setOrder = function(e) {
    var elem = e.currentTarget,
        newWorldOrder = elem.options[elem.selectedIndex].value,
        $newComments = $(this.getElem('newComments'));

    this.options.order = newWorldOrder;
    this.showDiscussion();
    this.loading();

    $newComments.empty();
    userPrefs.set('discussion.order', newWorldOrder);

    return this.fetchComments({
        page: 1
    }).then(function() {
        this.showHiddenComments();
        this.loaded();
        this.relativeDates();
    }.bind(this));
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
        $('#comment-'+ commentId +' .js-report-comment-container').first()
    ).removeClass('u-h');
};

Comments.prototype.addUser = function(user) {
    this.user = user;

    // Determine user staff status
    if (this.user && this.user.badge) {
        this.user.isStaff = this.user.badge.some(function (e) { // Returns true if any element in array satisfies function
            return e.name === 'Staff';
        });

        if (this.user.isStaff) {
            $('.d-discussion', this.elem)
                .removeClass('d-discussion--not-staff')
                .addClass('d-discussion--is-staff');
        }
    }

    if (!this.isReadOnly()) {
        RecommendComments.init();

        if (this.user && this.user.privateFields.canPostComment) {

            $(this.getClass('commentReply')).attr('href', '#'); // remove sign-in link

            this.on('click', this.getClass('commentReply'), this.replyToComment);
            this.on('click', this.getClass('commentPick'), this.handlePickClick);
        }
    }
};

Comments.prototype.relativeDates = function() {
    relativedates.init();
};

return Comments;
});
