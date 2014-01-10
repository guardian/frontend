define([
'common/utils/ajax',
'bonzo',
'qwery',
'common/modules/component',
'common/modules/identity/api',
'common/modules/discussion/comment-box',
'common/modules/discussion/recommend-comments',
'common/$'
], function(
ajax,
bonzo,
qwery,
Component,
Id,
CommentBox,
RecommendComments,
$
) {

/* =================================================================

This module requires refactoring pending an architecture change for the
discussion system based on designs for the Top Comments functionality
being signed off.

 - chrisfinch

================================================================= */

var TopComments = function(context, mediator, options, topCommentsSwitch) {
    this.context = context || document;
    this.mediator = mediator;
    this.setOptions(options);
    this.topCommentsSwitch = topCommentsSwitch;
};
Component.define(TopComments);

/**
 * @type {Object.<string.string>}
 * @override
 */
TopComments.prototype.classes = {
    comments: 'd-thread--top-level',
    topLevelComment: 'd-comment--top-level',
    reply: 'd-comment--response',
    showReplies: 'js-show-more-replies',

    topCommentTitle: "page-sub-header",

    comment: 'd-comment',
    commentActions: 'd-comment__actions__main',
    commentReply: 'd-comment__action--reply',

    showMoreFeatured: 'show-more__container--featured',
    showMoreFeaturedButton: 'js-show-more-top-comments',

    topCommentsContainer: 'discussion__comments__top',
    titleCounter: 'discussion__comment-count',
    fadeOut: 'd-image-fade'
};

/**
 * @type {string}
 * @override
 */
TopComments.prototype.endpoint = '/discussion/top:discussionId.json';

/** @type {Object.<string.*>} */
TopComments.prototype.defaultOptions = {
    discussionId: null,
    showRepliesCount: 3,
    user: null,
    sectionHeading: 'Featured Comments '
};

/** @type {Boolean} */
TopComments.prototype.hasHiddenComments = false;

/** @type {number} */
TopComments.prototype.currentPage = 1;

/** @type {NodeList=} */
TopComments.prototype.comments = null;

/** @type {NodeList=} */
TopComments.prototype.topLevelComments = null;

/** @type {Object=} */
TopComments.prototype.user = null;

TopComments.prototype.fetch = function(parent) {
    var self = this,
        endpoint = this.endpoint,
        opt;

    for (opt in this.options) {
        endpoint = endpoint.replace(':'+ opt, this.options[opt]);
    }

    return ajax({
        url: endpoint,
        type: 'json',
        method: 'get',
        crossOrigin: true
    }).then(
        function render(resp) {
            // Success: Render Top or Regular comments
            if (resp.currentCommentCount > 0 && self.topCommentsSwitch) {

                // Render Top Comments

                self.topCommentsAmount = resp.currentCommentCount;
                self.parent = parent;
                self.elem = bonzo.create(resp.html);
                $(self.getClass('topCommentsContainer'), parent).append(self.elem);
                self.elem = self.elem[0];
                self.elems = {};
                self.prerender();
                self.ready();

                self.mediator.emit("module:topcomments:loadcomments", { amount: 0 });
            } else {

                $('.discussion__comments--top-comments').remove();

                // Render Regular Comments
                self.mediator.emit("module:topcomments:loadcomments", { amount: 2, showLoader: true });
            }
        },
        function () {
            // Error: Render Regular Comments
            $('.discussion__comments--top-comments').remove();
            self.mediator.emit("module:topcomments:loadcomments", { amount: 2, showLoader: true });
        }
    );
};

/** @override */
TopComments.prototype.ready = function() {
    var initialShow = this.options.initialShow,
        self = this;

    // Ease of use
    this.user = this.options.user;
    this.topLevelComments = qwery(this.getClass('topLevelComment'), this.elem);
    this.comments = qwery(this.getClass('comment'), this.elem);
    this.commentsContainer = qwery(this.getClass('comments'), this.elem)[0];

    // calc max-height for top comments as 2/3 of viewport height bounded between 200-600
    var maxHeight = bonzo.viewport().height * 0.66;
    maxHeight = Math.max(maxHeight, 200);
    maxHeight = Math.min(maxHeight, 800);
    
    if (this.commentsContainer.offsetHeight > maxHeight) {
        this.truncateFeatured(parseInt(maxHeight, 10));
        this.on('click', this.getClass('showMoreFeaturedButton'), this.showAllFeatured);
    }

    var heading = document.querySelector('.js-top-comments');

    heading.childNodes[0].nodeValue = self.options.sectionHeading;
    
    if (self.topCommentsAmount === 1) {
        heading.childNodes[0].nodeValue = heading.childNodes[0].nodeValue.replace(/s\b/, '');
    } else {
        // Append top comment count to section title
       $(self.getClass('titleCounter')).removeClass('u-h')[0].innerHTML = "(" + self.topCommentsAmount + ")";
    }

    self.emit('ready');
};

TopComments.prototype.bindCommentEvents = function() {
    RecommendComments.init(this.context);

    if (this.user && this.user.privateFields.canPostComment) {
        this.on('click', this.getClass('commentReply'), this.replyToComment);
    }
};
 
TopComments.prototype.truncateFeatured = function(maxHeight){
    this.hasHiddenComments = true;
    $('.d-image-fade', this.parent).removeClass('u-h');
    $(this.getClass('showMoreFeatured'), this.elem).removeClass('u-h');
    $(this.commentsContainer).css("max-height", maxHeight + "px");
};

TopComments.prototype.showAllFeatured = function(e) {
    if (e) { e.preventDefault(); }
    this.hasHiddenComments = false;
    $('.d-image-fade', this.parent).addClass('u-h');
    $(this.getClass('showMoreFeatured'), this.elem).addClass('u-h');
    $(this.commentsContainer).css("max-height", "none");
};

/** @param {Event} e */
TopComments.prototype.replyToComment = function(e) {
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

return TopComments;


});
