define([
    '$',
    'utils/ajax',
    'bonzo',
    'qwery',
    'bean',
    'modules/component',
    'modules/identity/api',
    'modules/discussion/comment-box',
    'modules/discussion/recommend-comments',
    'modules/discussion/api'
], function(
    $,
    ajax,
    bonzo,
    qwery,
    bean,
    Component,
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
        this.endpoint = '/discussion/comment/'+ this.options.commentId +'.json';
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
    comments: 'd-thread--top-level',
    topLevelComment: 'd-comment--top-level',
    showMore: 'd-discussion__show-more',
    showMoreNewer: 'd-discussion__show-more--newer',
    showMoreOlder: 'd-discussion__show-more--older',
    showHidden: 'd-discussion__show-hidden',
    reply: 'd-comment--response',
    showReplies: 'js-show-more-replies',
    header: 'd-discussion__header',
    newComments: 'js-new-comments',

    comment: 'd-comment',
    commentActions: 'd-comment__actions__main',
    commentReply: 'd-comment__action--reply',
    commentPick: 'd-comment__action--pick',
    commentRecommend: 'd-comment__recommend'
};

/**
 * @type {string}
 * @override
 */
Comments.prototype.endpoint = '/discussion:discussionId.json';

/** @type {Object.<string.*>} */
Comments.prototype.defaultOptions = {
    discussionId: null,
    initialShow: 10,
    showRepliesCount: 3,
    user: null,
    commentId: null
};

/** @type {NodeList=} */
Comments.prototype.comments = null;

/** @type {NodeList=} */
Comments.prototype.topLevelComments = null;

/** @type {Object=} */
Comments.prototype.user = null;

/** @override */
Comments.prototype.prerender = function() {
    var self = this,
        heading = qwery('#comments')[0],
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

    if (this.topLevelComments.length > 0) {
        qwery(this.getClass('topLevelComment'), this.elem).forEach(function(elem, i) {
            if (i >= initialShow) {
                bonzo(elem).addClass('u-h');
            }
        });

        if (this.topLevelComments.length > initialShow) {
            if (!this.getElem('showMore')) {
                bonzo(this.getElem('comments')).append(
                    '<a class="'+ this.getClass('showHidden') +' cta" data-age="older" data-link-name="Show more comments" data-remove="true" href="/discussion'+
                        this.options.discussionId +'?page=1">'+
                        'Show older comments'+
                    '</a>');
            }
        }
    }

    // Hide excessive replies
    this.hideExcessReplies();
};

/** @override */
Comments.prototype.ready = function() {
    this.on('click', this.getClass('showReplies'), this.showMoreReplies);
    this.on('click', this.getClass('showMore'), this.loadMore);
    this.on('click', this.getClass('showHidden'), this.showHiddenComments);
    
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
        comment: id
    }).then(function(resp) {
        this.renderComments(resp, 'replaceWith');
        window.location.replace('#comment-'+ id);
    }.bind(this));
};

/**
 * @param {number} page
 */
Comments.prototype.gotoPage = function(page) {
    return this.fetchComments({
        page: page,
        position: 'replaceWith'
    });
};

/**
 * @param {Event} e
 */
Comments.prototype.loadMore = function(e) {
    e.preventDefault();
    var button = e.currentTarget,
        age = button.getAttribute('data-age'),
        buttonHTML = button.innerHTML,
        page = parseInt(button.getAttribute('data-page'), 10);

    if (button.getAttribute('data-disabled')) {
        return false;
    }

    button.innerHTML = 'Loading…';
    button.setAttribute('data-disabled', 'disabled');

    return this.fetchComments({
        page: page,
        position: age === 'newer' ? 'prepend' : 'append'
    }).then(function(resp) {
        button.removeAttribute('data-disabled');
        button.innerHTML = buttonHTML;
    }.bind(this));
};

/**
 * @param {Object.<string.*>}
 * options {
 *   page: {number},
 *   comment: {number},
 *   position: {string} append|prepend|replaceWith
 * }
 */
Comments.prototype.fetchComments = function(options) {
    var url = options.comment ? '/discussion/comment/'+ options.comment +'.json' :
                '/discussion/'+ this.options.discussionId +'.json'+ (options.page ? '?page='+ options.page : '');
    
    return ajax({
        url: url,
        type: 'json',
        method: 'get',
        crossOrigin: true
    }).then(this.renderComments.bind(this, options.position));
};

/**
 * @param {Object} resp
 * @param {String} position append|prepend|replaceWith
 */
Comments.prototype.renderComments = function(position, resp) {
    var html = bonzo.create(resp.html),
        comments = qwery(this.getClass('topLevelComment'), html);

    if (!resp.hasMore) {
        this.removeShowMoreButton();
    }

    $(this.getClass('showMoreOlder'), this.elem).replaceWith($(this.getClass('showMoreOlder'), html));
    $(this.getClass('showMoreNewer'), this.elem).replaceWith($(this.getClass('showMoreNewer'), html));

    // Stop duplication in new comments section
    qwery(this.getClass('comment'), this.getElem('newComments')).forEach(function(comment) {
        var $comment = $('#'+ comment.id, html);
        if ($comment.length === 1) {
            $(comment).remove();
        }
    });

    bonzo(this.getElem('comments'))[position](comments);
    this.hideExcessReplies(comments);

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

    if (this.getElem('showMore').getAttribute('data-remove') === 'true') {
        bonzo(this.getElem('showMore')).remove();
    }
    this.emit('first-load');
};

/**
 * @param {Event}
 */
Comments.prototype.showMoreReplies = function(e) {
    bonzo(qwery(this.getClass('reply'), bonzo(e.currentTarget).parent()[0])).removeAttr('hidden');
    bonzo(e.currentTarget).remove();
};

/**
 * @param {Array.<Element>=} comments (optional)
 */
Comments.prototype.hideExcessReplies = function(comments) {
    var replies, repliesToHide,
        self = this;

    comments = comments || this.topLevelComments;
    comments.forEach(function(elem, i) {
        replies = qwery(self.getClass('reply'), elem);

        if (replies.length > self.options.showRepliesCount) {
            repliesToHide = replies.slice(self.options.showRepliesCount, replies.length);
            bonzo(repliesToHide).attr('hidden', 'hidden');

            bonzo(qwery('.d-thread--responses', elem)).append(
                '<li class="'+ self.getClass('showReplies', true) +' cta" data-link-name="Show more replies" data-is-ajax>Show '+
                    repliesToHide.length + ' more ' + (repliesToHide.length === 1 ? 'reply' : 'replies') +
                '</li>');
        }
    });
};

/**
 * @return {Boolean}
 */
Comments.prototype.isReadOnly = function() {
    return this.elem.getAttribute('data-read-only') === 'true';
};

Comments.prototype.removeShowMoreButton = function() {
    bonzo(this.getElem('showMore')).remove();
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
        commentElem = bonzo.create(document.getElementById('tmpl-comment').innerHTML)[0];
        bonzo(commentElem).addClass('fade-in'); // Comments now appear with CSS Keyframe animation

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

    if (this.user && this.user.isStaff) {
        // Hack to allow staff badge to appear
        var staffBadge = bonzo.create(document.getElementById('tmpl-staff-badge').innerHTML);
        $('.d-comment__meta div', commentElem).first().append(staffBadge);
    }

    // Stupid hack. Will rearchitect.
    if (!parent) {
        bonzo(this.getElem('newComments')).prepend(commentElem);
    } else {
        bonzo(parent).append(commentElem);
    }

    if (focus) {
        window.location.replace('#comment-'+ comment.id);
    }
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
        commentBox = new CommentBox(this.context, this.mediator, {
            discussionId: this.options.discussionId,
            premod: this.user.privateFields.isPremoderated,
            state: 'response',
            replyTo: {
                commentId: replyToId,
                author: replyToAuthor,
                authorId: replyToAuthorId
            },
            focus: true,
            cancelable: true
        });

    // this is a bit toffee, but we don't have .parents() in bonzo
    parentCommentEl = $replyToComment.hasClass(this.getClass('topLevelComment', true)) ? $replyToComment[0] : $replyToComment.parent().parent()[0];

    // I don't like this, but UX says go
    showRepliesElem = qwery(this.getClass('showReplies'), parentCommentEl);
    if (showRepliesElem.length > 0) {
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
        self.addComment(comment, false, responses);
        this.destroy();
    });
};

return Comments;


});
