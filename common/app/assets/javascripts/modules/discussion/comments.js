define([
    'common/$',
    'bonzo',
    'qwery',
    'bean',
    'common/utils/ajax',
    'common/modules/component',
    'common/modules/userPrefs',
    'common/modules/identity/api',
    'common/modules/discussion/comment-box',
    'common/modules/discussion/recommend-comments',
    'common/modules/discussion/api'
], function(
    $,
    bonzo,
    qwery,
    bean,
    ajax,
    Component,
    userPrefs,
    Id,
    CommentBox,
    RecommendComments,
    DiscussionApi
) {
'use strict';
/**
 * TODO (jamesgorrie):
 * * Move recommending into this, it has no need for it's own module.
 * * Get the selectors up to date with BEM
 * * Move over to $ instead of qwery & bonzo
 * @constructor
 * @extends Component
 * @param {Element=} context
 * @param {Object} mediator
 * @param {Object=} options
 */
var Comments = function(context, mediator, options) {
    this.context = context || document;
    this.mediator = mediator;
    this.setOptions(options);

    if (this.options.commentId) {
        this.endpoint = '/discussion/comment-permalink/'+ this.options.commentId +'.json';
    }

    if (userPrefs.get('discussion.order')) {
        this.options.order = userPrefs.get('discussion.order');
    }

    if (this.options.order === 'oldest') {
        this.endpoint = '/discussion/oldest'+ this.options.discussionId + '.json';
    }
};
Component.define(Comments);

/**
 * @override
 * @type {string}
 */
Comments.prototype.componentClass = 'd-discussion';

/**
 * @type {Object.<string.*>}
 * @override
 */
Comments.prototype.classes = {
    container: 'discussion__comments__container',
    comments: 'd-thread--top-level',
    topLevelComment: 'd-comment--top-level',
    showMore: 'd-discussion__show-more',
    showMoreNewerContainer: 'show-more__container--newer',
    showMoreOlderContainer: 'show-more__container--older',
    showMoreHiddenContainer: 'show-more__container--hidden',
    showMoreNewer: 'd-discussion__show-more--newer',
    showMoreOlder: 'd-discussion__show-more--older',
    showMoreLoading: 'd-discussion__show-more-loading',
    showHidden: 'd-discussion__show-hidden',
    reply: 'd-comment--response',
    showReplies: 'js-show-more-replies',
    header: 'd-discussion__header',
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
    commentTimestampJs: 'js-timestamp'
};

/** @type {Object.<string.*>} */
Comments.prototype.defaultOptions = {
    discussionId: null,
    initialShow: 10,
    showRepliesCount: 3,
    user: null,
    commentId: null,
    order: 'newest'
};

/**
 * @type {string}
 * @override
 */
Comments.prototype.endpoint = '/discussion:discussionId.json';

/** @type {Boolean} */
Comments.prototype.hasHiddenComments = false;

/** @type {NodeList=} */
Comments.prototype.comments = null;

/** @type {NodeList=} */
Comments.prototype.topLevelComments = null;

/** @type {Object=} */
Comments.prototype.user = null;

/** @override */
Comments.prototype.prerender = function() {
    var self = this,
        heading = qwery(this.getClass('heading'), this.getClass('container'))[0],
        commentCount = this.elem.getAttribute('data-comment-count'),
        initialShow = this.options.initialShow;

    heading.innerHTML += ' <span class="discussion__comment-count">('+ commentCount +')</span>';

    // Ease of use
    this.user = this.options.user;
    this.topLevelComments = qwery(this.getClass('topLevelComment'), this.elem);
    this.comments = qwery(this.getClass('comment'), this.elem);

    // Determine user staff status
    if (this.user && this.user.badge) {
        this.user.isStaff = this.user.badge.some(function (e) { // Returns true if any element in array satisfies function
            return e.name === 'Staff';
        });

        if (this.user.isStaff) {
            this.removeState('not-staff');
            this.setState('is-staff');
        }
    }

    if (this.topLevelComments.length > initialShow) {
        var nonblocked_comments = qwery(this.getClass('topLevelComment'), this.elem).filter(function(el) {
            return !bonzo(el).hasClass(self.getClass('commentBlocked', true));
        });

        if (nonblocked_comments.length >= initialShow) {
            bonzo(this.topLevelComments).addClass('u-h');
            bonzo(nonblocked_comments.slice(0, initialShow)).removeClass('u-h');
        } else {
            bonzo(this.topLevelComments.slice(initialShow)).addClass('u-h');
        }

        bonzo(this.getElem('showMoreOlderContainer')).addClass('u-h');
        bonzo(this.getElem('showMoreHiddenContainer')).removeClass('u-h');

    }
};

/** @override */
Comments.prototype.ready = function() {
    this.on('click', this.getClass('showReplies'), this.getMoreReplies);
    this.on('click', this.getClass('showMore'), this.loadMore);
    this.on('click', this.getClass('showHidden'), this.showHiddenComments);
    this.on('change', this.getClass('orderControl'), this.setOrder);
    this.mediator.on('discussion:comment:recommend:fail', this.recommendFail.bind(this));

    this.addMoreRepliesButtons();
    
    if (!this.isReadOnly()) {
        this.bindCommentEvents();
    }

    if (this.options.commentId) {
        var comment = $('#comment-'+ this.options.commentId);

        if (comment.attr('hidden')) {
            bean.fire($(this.getClass('showReplies'), comment.parent())[0], 'click'); // Bonzo can be rubbish (without Ender)
        }

        window.location.replace('#comment-'+ this.options.commentId);
    }

    if (!this.getElem('showMoreNewer')) {
        $(this.getClass('showMoreNewerContainer')).addClass('u-h');
    }
    if (!this.getElem('showMoreOlder')) {
        $(this.getClass('showMoreOlderContainer')).addClass('u-h');
    }

    this.emit('ready');
};

/**
 * This is here as we don't want to create a comment Component
 */
Comments.prototype.bindCommentEvents = function() {
    RecommendComments.init(this.context);

    if (this.user && this.user.privateFields.canPostComment) {
        this.on('click', this.getClass('commentReply'), this.replyToComment);
        this.on('click', this.getClass('commentPick'), this.handlePickClick);
    }
};

/**
 * @param {Event} e
 */
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

/**
 * @param {Element} commentId
 * @param {Bonzo} $thisButton
 * @return {Reqwest} AJAX Promise
 */
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

/**
 * @param {Element} comment
 * @param {Bonzo} $thisButton
 * @return {Reqwest} AJAX Promise
 */
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

/**
 * @param {number} id
 * @return {Reqwest|null}
 */
Comments.prototype.gotoComment = function(id) {
    var comment = $('#comment-'+ id, this.elem);
    if (comment.length > 0) {
        window.location.replace('#comment-'+ id);
        return;
    }

    return this.fetchComments({
        comment: id,
        position: 'replace'
    }).then(function(resp) {
        window.location.replace('#comment-'+ id);
    }.bind(this));
};

/**
 * @param {number} page
 */
Comments.prototype.gotoPage = function(page) {
    return this.fetchComments({
        page: page,
        position: 'replace'
    });
};

/**
 * @param {Event} e
 */
Comments.prototype.loadMore = function(e) {
    e.preventDefault();
    var button = e.currentTarget,
        age = button.getAttribute('data-age'),
        page = parseInt(button.getAttribute('data-page'), 10);

    if (button.getAttribute('data-disabled')) {
        return false;
    }

    var $button = bonzo(button),
        $container = $button.parent();
    $button.remove();
    var $loadingElem = bonzo.create('<span class="' + this.getClass('showMoreLoading',true) + '">Loading…</span>');
    $container.empty().append($loadingElem);

    return this.fetchComments({
        page: page,
        position: age === 'newer' ? 'prepend' : 'append'
    });
};

/**
 * @param {Object.<string.*>}
 * options {
 *   page: {number},
 *   comment: {number},
 *   position: {string} append|prepend|replace
 * }
 */
Comments.prototype.fetchComments = function(options) {
    var url = options.comment ? '/discussion/comment-permalink/'+ options.comment +'.json' :
                '/discussion/'+ (this.options.order === 'oldest' ? 'oldest' : '') + this.options.discussionId +'.json?'+
                (options.page ? '&page='+ options.page : '') +
                '&maxResponses=3';
    
    return ajax({
        url: url,
        type: 'json',
        method: 'get',
        crossOrigin: true
    }).then(this.renderComments.bind(this, options.position));
};

/**
 * @param {Object} resp
 * @param {String} position append|prepend|replace
 */
Comments.prototype.renderComments = function(position, resp) {
    var html = bonzo.create(resp.html),
        comments = qwery(this.getClass('topLevelComment'), html);

    var replaceButton = function(name) {
        var newButton = qwery(this.getClass(name), html),
            currentButton = qwery(this.getClass(name), this.elem),
            container = this.getElem(name + 'Container');
        $(this.getClass('showMoreLoading'), container).remove(); // remove loading text span

        if (newButton.length === 0) {
            bonzo(container).addClass('u-h');
        } else if (currentButton.length === 0) {
            bonzo(container).append(newButton);
        }
    }.bind(this);

    replaceButton('showMoreOlder');
    replaceButton('showMoreNewer');

    // Stop duplication in new comments section
    qwery(this.getClass('comment'), this.getElem('newComments')).forEach(function(comment) {
        var $comment = $('#'+ comment.id, html);
        if ($comment.length === 1) {
            $(comment).remove();
        }
    });

    if (position === 'replace') {
        bonzo(this.getElem('comments')).empty().append(comments);
    } else {
        bonzo(this.getElem('comments'))[position](comments);
    }
    this.addMoreRepliesButtons(comments);

    // Dealing with where new comments are posted
    if (this.options.order === 'oldest') {
        $(this.getElem('newComments')).insertAfter($(this.getElem('showMoreOlderContainer')));
    } else {
        $(this.getElem('newComments')).insertBefore($(this.getElem('showMoreNewerContainer')));
    }

    if (!this.isReadOnly()) {
        RecommendComments.init(this.context);
    }

    this.emit('loaded');
};

/**
 * @param {Event} e (optional)
 */
Comments.prototype.showHiddenComments = function(e) {
    if (e) { e.preventDefault(); }

    qwery(this.getClass('topLevelComment'), this.elem).forEach(function(elem, i) {
        bonzo(elem).removeClass('u-h');
    });

    bonzo(this.getElem('showMoreOlderContainer')).removeClass('u-h');
    bonzo(this.getElem('showMoreHiddenContainer')).addClass('u-h');

    this.emit('first-load');
};

/**
 * @param {NodeList} comments
 */
Comments.prototype.addMoreRepliesButtons = function (comments) {
    var self = this;

    comments = comments || this.topLevelComments;
    comments.forEach(function(elem, i) {
        var replies = parseInt(elem.getAttribute("data-comment-replies"), 10);
        var rendered_replies = qwery(self.getClass('reply'), elem);

        if (rendered_replies.length < replies) {

            var numHiddenReplies = replies - rendered_replies.length;

            var showButton = "";
            showButton += '<li class="' + self.getClass('showReplies', true) + '" ';
            showButton += 'data-link-name="Show more replies" ';
            showButton += 'data-is-ajax data-comment-id="' + elem.getAttribute("data-comment-id") + '">';
            showButton += '<span><i class="i i-plus-white-small"></i></span>';
            showButton += 'Show ' + numHiddenReplies + ' more ' + (numHiddenReplies === 1 ? 'reply' : 'replies');
            showButton += '</li>';

            showButton = bonzo.create(showButton);
            bonzo(showButton).data("source-comment", elem);

            bonzo(qwery('.d-thread--responses', elem)).append(showButton);
        }
    });
};

/**
 * @param {Event}
 */
Comments.prototype.getMoreReplies = function(event) {
    event.preventDefault();
    var self = this,
        source = bonzo(event.target).data('source-comment');
    
    ajax({
        url: '/discussion/comment/'+ event.target.getAttribute('data-comment-id') +'.json',
        type: 'json',
        method: 'get',
        crossOrigin: true
    }).then(function (resp) {
        var comment = bonzo.create(resp.html),
            replies = qwery(self.getClass('reply'), comment);

        replies = replies.slice(self.options.showRepliesCount, replies.length);
        bonzo(qwery('.d-thread--responses', source)).append(replies);
        bonzo(event.currentTarget).addClass('u-h');
        if (!self.isReadOnly()) {
            RecommendComments.init(source);
        }
    });
};

/**
 * @return {Boolean}
 */
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
        bonzo(this.getElem('newComments')).prepend(commentElem);
    } else {
        $commentElem.removeClass(this.getClass('topLevelComment', true));
        $commentElem.addClass(this.getClass('reply', true));
        bonzo(parent).append($commentElem);
    }

    window.location.replace('#comment-'+ comment.id);
};

/** @param {Event} e */
Comments.prototype.replyToComment = function(e) {
    var parentCommentEl, showRepliesElem,
        replyLink = e.currentTarget,
        replyToId = replyLink.getAttribute('data-comment-id'),
        self = this;

    // There is already a comment box for this on the page
    if (document.getElementById('reply-to-'+ replyToId)) {
        document.getElementById('reply-to-'+ replyToId).focus();
        return;
    }

    var replyToComment = qwery('#comment-'+ replyToId)[0],
        replyToAuthor = replyToComment.getAttribute('data-comment-author'),
        replyToAuthorId = replyToComment.getAttribute('data-comment-author-id'),
        $replyToComment = bonzo(replyToComment),
        replyToBody = qwery(this.getClass('commentBody'), replyToComment)[0].innerHTML,
        replyToTimestamp = qwery(this.getClass('commentTimestampJs'), replyToComment)[0].innerHTML,
        commentBox = new CommentBox(this.context, this.mediator, {
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

/**
 * @param {Object.<string.*>} comment
 */
Comments.prototype.recommendFail = function(comment) {};

Comments.prototype.showDiscussion = function() {
    var showDiscussionElem = $('.d-discussion__show-all-comments');
    if (!showDiscussionElem.hasClass('u-h')) {
        bean.fire(showDiscussionElem, 'click');
        showDiscussionElem.addClass('u-h');
    }
};

Comments.prototype.loading = function() {
    $(this.getElem('loader')).removeClass('u-h');
    $(this.getElem('comments')).addClass('u-h');
    $(this.getElem('showMoreOlderContainer')).addClass('u-h');
    $(this.getElem('showMoreNewerContainer')).addClass('u-h');
};

Comments.prototype.loaded = function() {
    $(this.getElem('loader')).addClass('u-h');
    $(this.getElem('comments')).removeClass('u-h');
    $(this.getElem('showMoreOlderContainer')).removeClass('u-h');
    $(this.getElem('showMoreNewerContainer')).removeClass('u-h');
};

/**
 * @param {Event} e
 */
Comments.prototype.setOrder = function(e) {
    var elem = e.currentTarget,
        newWorldOrder = elem.options[elem.selectedIndex].value,
        $newComments = $(this.getElem('newComments'));

    this.options.order = newWorldOrder;
    this.options.initialShow = this.defaultOptions.initialShow;
    this.showDiscussion();
    this.loading();

    bonzo(this.getElem('showMoreHiddenContainer')).addClass('u-h');

    $(this.getElem('showMoreOlderContainer')).empty();
    $(this.getElem('showMoreNewerContainer')).empty();

    $newComments.empty();
    userPrefs.set('discussion.order', newWorldOrder);

    return this.fetchComments({
        page: 1,
        position: 'replace'
    }).then(function() {
        this.loaded();
    }.bind(this));
};

return Comments;


});
