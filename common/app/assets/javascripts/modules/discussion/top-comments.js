define([
'utils/ajax',
'bonzo',
'qwery',
'modules/component',
'modules/identity/api',
'modules/discussion/comment-box',
'modules/discussion/recommend-comments',
'$'
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
    showMore: 'js-show-more-top-comments',
    reply: 'd-comment--response',
    showReplies: 'js-show-more-replies',

    topCommentTitle: "page-sub-header",

    comment: 'd-comment',
    commentActions: 'd-comment__actions__main',
    commentReply: 'd-comment__action--reply',

    topCommentHolder: 'discussion__comments__top',
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
    heightLimit: 600, // max-height in _discussion.scss .discussion__comments__top
    showRepliesCount: 3,
    user: null,
    sectionHeading: 'Top Comments '
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
            if (resp.commentCount > 0 && self.topCommentsSwitch) {

                // Render Top Comments

                self.topCommentsAmount = resp.commentCount;
                self.parent = parent;
                self.elem = bonzo.create(resp.html);
                $('.discussion__comments__top', parent).append(self.elem); // refactor
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

    var h = self.elem.offsetHeight;

    if (h >= self.options.heightLimit) {

        self.hasHiddenComments = true;

        $('.d-image-fade', self.parent).removeClass('u-h'); // refactor

        var showMoreButton = [];

        showMoreButton.push('<a class="js-show-more-top-comments cta" data-link-name="Show more top comments" data-remove="true" href="/discussion');
        showMoreButton.push(self.options.discussionId);
        showMoreButton.push('?page=1">');
        showMoreButton.push('Show more top comments');
        showMoreButton.push('</a>');

        if (!self.showMoreButton) {
            self.showMoreButton = bonzo(showMoreButton.join(''));
            bonzo(self.parent).after(self.showMoreButton[0]);
            self.showMoreButton = qwery(self.getClass('showMore'))[0];
        }
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

/**
* @param {Event} e
*/
TopComments.prototype.showMore = function(e) {
    var self = this;
    e.preventDefault();

    if (self.showMoreButton.getAttribute('data-disabled') === 'disabled') {
        return;
    }

    if (this.hasHiddenComments) {
        this.showHiddenComments();
    }
};

TopComments.prototype.showHiddenComments = function() {

    /* ======================= REFACTOR ME ======================= */

    $('.discussion__comments__top', this.parent).css("max-height", "none");
    $('.d-discussion', this.parent).css("max-height", "none");

    this.hasHiddenComments = false;

    $(this.showMoreButton).addClass('u-h'); // Not removing because of ophan error...

    $('.d-image-fade', this.parent).addClass('u-h');
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
