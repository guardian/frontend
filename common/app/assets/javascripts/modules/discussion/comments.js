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
        this.endpoint = '/discussion/comment-redirect/'+ this.options.commentId +'.json';
    }
};
Component.define(Comments);

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
    reply: 'd-comment--response',
    showReplies: 'js-show-more-replies',
    header: 'd-discussion__header',

    comment: 'd-comment',
    commentActions: 'd-comment__actions__main',
    commentReply: 'd-comment__action--reply',
    commentPick: 'd-comment__pick',
    commentRecommend: 'd-comment__recommend'
};

/** @type {Object.<string.*>} */
Comments.prototype.defaultOptions = {
    discussionId: null,
    initialShow: 10,
    showRepliesCount: 3,
    user: null,
    commentId: null
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
        this.user.is_staff = this.user.badge.some(function (e) { // Returns true if any element in array satisfies function
            return e.name === 'Staff';
        });
    }

    if (this.topLevelComments.length > 0) {
        qwery(this.getClass('topLevelComment'), this.elem).forEach(function(elem, i) {
            if (i >= initialShow) {
                self.hasHiddenComments = true;
                bonzo(elem).addClass('u-h');
            }
        });

        if (this.topLevelComments.length > initialShow) {
            if (!this.getElem('showMore')) {
                bonzo(this.getElem('comments')).append(
                    '<a class="d-discussion__show-more cta" data-age="older" data-link-name="Show more comments" data-remove="true" href="/discussion'+
                        this.options.discussionId +'?page=1">'+
                        'Show older comments'+
                    '</a>');
            }
        }
    }
};

/** @override */
Comments.prototype.ready = function() {
    this.on('click', this.getClass('showReplies'), this.getMoreReplies);
    this.on('click', this.getClass('showMore'), this.showMore);

    this.bindMoreReplies();
    
    if (!this.isReadOnly()) {
        this.bindCommentEvents();
    }

    if (this.options.commentId) {
        var comment = $('#comment-'+ this.options.commentId);

        if (comment.attr('hidden')) {
            bean.fire($(this.getClass('showReplies'), comment.parent())[0], 'click'); // Bonzo can be rubbish (without Ender)
        }

        window.location.hash = '#_';
        window.location.hash = '#comment-'+ this.options.commentId;
    }

    this.emit('ready');
};

/**
 * This is here as we don't want to create a comment Component
 */
Comments.prototype.bindCommentEvents = function() {
    RecommendComments.init(this.context);

    if (this.user && this.user.privateFields.canPostComment) {
        this.renderPickButtons();
        this.on('click', this.getClass('commentReply'), this.replyToComment);
    }
};

/**
 * @param {NodeList} comments
 */
Comments.prototype.renderPickButtons = function(comments) {
    var actions,
        self = this,
        buttonText = '<div class="u-fauxlink d-comment__action d-comment__action--pick" role="button"></div>',
        sepText = '<span class="d-comment__seperator d-comment__action">|</span>';

    comments = comments || self.comments;

    if (self.user.is_staff) {
        comments.forEach(function (e) {
            if (e.getAttribute('data-comment-author-id') !== self.user.userId) {
                var button = bonzo(bonzo.create(buttonText))
                                .text(e.getAttribute('data-comment-highlighted') !== 'true' ? 'Pick' : 'Un-Pick');
                button.data('thisComment', e);
                var sep = bonzo.create(sepText);
                $(self.getClass('commentActions'), e).append([sep[0],button[0]]);
                self.on('click', button, self.handlePickClick.bind(self));
            }
        });
    }
};

/**
 * @param {Event} event
 */
Comments.prototype.handlePickClick = function(event) {
    event.preventDefault();

    var thisComment = bonzo(event.target).data('thisComment'),
        $thisButton = $(event.target),
        promise = thisComment.getAttribute('data-comment-highlighted') === 'true' ? this.unPickComment.bind(this) : this.pickComment.bind(this);

    promise(thisComment, $thisButton)
        .fail(function (resp) {
            var responseText = resp.response.length > 0 ? JSON.parse(resp.response).message : resp.statusText;
            $(event.target).text(responseText);
        });
};

/**
 * @param {Element} thisComment
 * @param {Bonzo} $thisButton
 * @return {Reqwest} AJAX Promise
 */
Comments.prototype.pickComment = function(thisComment, $thisButton) {
    var self = this;
    return DiscussionApi
        .pickComment(thisComment.getAttribute('data-comment-id'))
        .then(function () {
            $(self.getClass('commentPick'), thisComment).removeClass('u-h');
            $(self.getClass('commentRecommend'), thisComment).addClass('d-comment__recommend--left');
            $thisButton.text('Un-pick');
            thisComment.setAttribute('data-comment-highlighted', true);
        });
};

/**
 * @param   {Element}      thisComment
 * @param   {Bonzo}    $thisButton
 * @return  {Reqwest}       AJAX Promise
 */
Comments.prototype.unPickComment = function(thisComment, $thisButton) {
    var self = this;
    return DiscussionApi
        .unPickComment(thisComment.getAttribute('data-comment-id'))
        .then(function () {
            $(self.getClass('commentPick'), thisComment).addClass('u-h');
            $(self.getClass('commentRecommend'), thisComment).removeClass('d-comment__recommend--left');
            $thisButton.text('Pick');
            thisComment.setAttribute('data-comment-highlighted', false);
        });
};

/**
 * @param {Event} e
 */
Comments.prototype.showMore = function(e) {
    if (e) { e.preventDefault(); }

    var showMoreButton = e.currentTarget,
        age = showMoreButton.getAttribute('data-age'),
        toPage = parseInt(showMoreButton.getAttribute('data-page'), 10),
        callback = age === 'older' ? this.showOlder.bind(this) : this.showNewer.bind(this);

    if (showMoreButton.getAttribute('data-disabled') === 'disabled') {
        return;
    }

    if (this.hasHiddenComments) {
        this.showHiddenComments();
    } else {
        showMoreButton.innerHTML = 'Loading…';
        showMoreButton.setAttribute('data-disabled', 'disabled');
        ajax({
            url: '/discussion'+ this.options.discussionId +'.json?page='+ toPage + '&maxResponses=3',
            type: 'json',
            method: 'get',
            crossOrigin: true
        }).then(callback);
    }
};

/**
 * @param {Object} resp
 */
Comments.prototype.showNewer = function(resp) {
    this.commentsLoaded(resp, 'newer');
};

/**
 * @param {Object} resp
 */
Comments.prototype.showOlder = function(resp) {
    this.commentsLoaded(resp, 'older');
};

/**
 * @param {Object} resp
 * @param {String} age (optional)
 */
Comments.prototype.commentsLoaded = function(resp, age) {
    age = age || 'older';
    var html = bonzo.create(resp.html),
        comments = qwery(this.getClass('topLevelComment'), html),
        showMoreButton = this.getElem('showMore');

    if (!resp.hasMore) {
        this.removeShowMoreButton();
    }

    $(this.getClass('showMoreOlder'), this.elem).replaceWith($(this.getClass('showMoreOlder'), html));
    $(this.getClass('showMoreNewer'), this.elem).replaceWith($(this.getClass('showMoreNewer'), html));

    if (!this.isReadOnly()) {
        this.renderPickButtons(qwery(this.getClass('comment'), bonzo(comments).parent()));
    }
    
    bonzo(this.getElem('comments'))[age === 'older' ? 'append' : 'prepend'](comments);

    showMoreButton.innerHTML = 'Show '+ age +' comments';
    showMoreButton.removeAttribute('data-disabled');

    this.bindMoreReplies(comments);

    if (!this.isReadOnly()) {
        RecommendComments.init(this.context);
    }

    this.emit('loaded');
};

Comments.prototype.showHiddenComments = function() {
    qwery(this.getClass('topLevelComment'), this.elem).forEach(function(elem, i) {
        bonzo(elem).removeClass('u-h');
    });
    this.hasHiddenComments = false;

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

Comments.prototype.getMoreReplies = function(event) {
    event.preventDefault();
    var self = this,
        source = bonzo(event.target).data("source-comment");
    
    ajax({
        url: '/discussion/comment/'+ event.target.getAttribute("data-comment-id") +'.json',
        type: 'json',
        method: 'get',
        crossOrigin: true
    }).then(function (resp) {
        var comment = bonzo.create(resp.html);
        var replies = qwery(self.getClass('reply'), comment);

        replies.sort(function compareFunction (a, b) {
            a = new Date(a.getAttribute("data-comment-timestamp")).getTime();
            b = new Date(b.getAttribute("data-comment-timestamp")).getTime();

            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        });

        replies = replies.slice(self.options.showRepliesCount, replies.length);
        bonzo(qwery('.d-thread--responses', source)).append(replies);
        bonzo(event.currentTarget).addClass("u-h");
        if (!self.isReadOnly()) {
            RecommendComments.init(source);
        }
    });
};

Comments.prototype.bindMoreReplies = function (comments) {
    var repliesToHide,
        self = this;

    comments = comments || this.topLevelComments;
    comments.forEach(function(elem, i) {
        
        var replies = parseInt(elem.getAttribute("data-comment-replies"), 10);
        var rendered_replies = qwery(self.getClass('reply'), elem);

        if (rendered_replies.length < replies) {
            // Get extra replies on click
            // repliesToHide = replies.slice(self.options.showRepliesCount, replies.length);
            // bonzo(repliesToHide).attr('hidden', 'hidden');

            var numHiddenReplies = replies - rendered_replies.length;

            var showButton = [];
            showButton.push('<li class="');
            showButton.push(self.getClass('showReplies', true));
            showButton.push(' cta" data-link-name="Show more replies" data-is-ajax data-comment-id="');
            showButton.push(elem.getAttribute("data-comment-id"));
            showButton.push('">Show ');
            showButton.push(numHiddenReplies);
            showButton.push(' more ');
            showButton.push((numHiddenReplies === 1 ? 'reply' : 'replies'));
            showButton.push('</li>');
            showButton = bonzo.create(showButton.join(""));
            bonzo(showButton).data("source-comment", elem);

            bonzo(qwery('.d-thread--responses', elem)).append(showButton);
        }

        // replies = qwery(self.getClass('reply'), elem);
        // if (replies.length > self.options.showRepliesCount) {
        //     repliesToHide = replies.slice(self.options.showRepliesCount, replies.length);
        //     bonzo(repliesToHide).attr('hidden', 'hidden');

        //     bonzo(qwery('.d-thread--responses', elem)).append(
        //         '<li class="'+ self.getClass('showReplies', true) +' cta" data-link-name="Show more replies" data-is-ajax>Show '+
        //             repliesToHide.length + ' more ' + (repliesToHide.length === 1 ? 'reply' : 'replies') +
        //         '</li>');
        // }
    });
};

/**
 * @param {Array.<Element>=} comments (optional)
 */
// Comments.prototype.hideExcessReplies = function(comments) {
//     var replies, repliesToHide,
//         self = this;

//     comments = comments || this.topLevelComments;
//     comments.forEach(function(elem, i) {
//         replies = qwery(self.getClass('reply'), elem);
//         if (replies.length > self.options.showRepliesCount) {
//             repliesToHide = replies.slice(self.options.showRepliesCount, replies.length);
//             bonzo(repliesToHide).attr('hidden', 'hidden');

//             bonzo(qwery('.d-thread--responses', elem)).append(
//                 '<li class="'+ self.getClass('showReplies', true) +' cta" data-link-name="Show more replies" data-is-ajax>Show '+
//                     repliesToHide.length + ' more ' + (repliesToHide.length === 1 ? 'reply' : 'replies') +
//                 '</li>');
//         }
//     });
// };

/**
 * @return {Boolean}
 */
Comments.prototype.isReadOnly = function() {
    return this.elem.getAttribute('data-read-only') === 'true';
};

/**
 * @param {Object} resp
 */
Comments.prototype.commentsLoaded = function(resp) {
    var comments = qwery(this.getClass('topLevelComment'), bonzo.create(resp.html)),
        showMoreButton = this.getElem('showMore');

    this.currentPage++;
    if (!resp.hasMore) {
        this.removeShowMoreButton();
    }

    if (!this.isReadOnly()) {
        this.renderPickButtons(qwery(this.getClass('comment'), bonzo(comments).parent()));
    }

    bonzo(this.getElem('comments')).append(comments);

    showMoreButton.innerHTML = 'Show more';
    showMoreButton.removeAttribute('data-disabled');

    this.bindMoreReplies(comments);

    if (!this.isReadOnly()) {
        RecommendComments.init(this.context);
    }
    this.emit('loaded');
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

    if (this.user.is_staff) {
        // Hack to allow staff badge to appear
        var staffBadge = bonzo.create(document.getElementById('tmpl-staff-badge').innerHTML);
        $('.d-comment__meta div', commentElem).first().append(staffBadge);
    }

    // Stupid hack. Will rearchitect.
    if (!parent) {
        bonzo(this.getElem('comments')).prepend(commentElem);
    } else {
        bonzo(parent).append(commentElem);
    }

    window.location.hash = '#_';
    if (focus) {
        window.location.hash = '#comment-'+ comment.id;
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
