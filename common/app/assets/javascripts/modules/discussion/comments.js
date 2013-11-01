define([
    'ajax',
    'bonzo',
    'qwery',
    'modules/component',
    'modules/id',
    'modules/discussion/comment-box',
    'modules/discussion/recommend-comments'
], function(
    ajax,
    bonzo,
    qwery,
    Component,
    Id,
    CommentBox,
    RecommendComments
) {

/**
 * TODO (jamesgorrie): Move recommending into this,
 * it has no need for it's own module.
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
};
Component.define(Comments);

/** @type {Object.<string.*>} */
Comments.CONFIG = {
    endpoint: '/discussion:discussionId.json',
    classes: {
        comments: 'd-thread--top-level',
        topLevelComment: 'd-comment--top-level',
        showMore: 'js-show-more-comments',
        reply: 'd-comment--response',
        showReplies: 'js-show-more-replies',

        comment: 'd-comment',
        commentActions: 'd-comment__actions__main',
        commentReply: 'd-comment__action--reply'
    }
};

/** @type {Object.<string.*>} */
Comments.prototype.defaultOptions = {
    discussionId: null,
    initialShow: 10,
    showRepliesCount: 3,
    user: null
};

/** @type {Boolean} */
Comments.prototype.hasHiddenComments = false;

/** @type {number} */
Comments.prototype.currentPage = 1;

/** @type {NodeList=} */
Comments.prototype.comments = null;

/** @type {NodeList=} */
Comments.prototype.topLevelComments = null;

/** @type {Object=} */
Comments.prototype.user = null;

/** @override */
Comments.prototype.ready = function() {
    var initialShow = this.options.initialShow,
        self = this;

    // Ease of use
    this.user = this.options.user;
    this.topLevelComments = qwery(this.getClass('topLevelComment'), this.elem);
    this.comments = qwery(this.getClass('comment'), this.elem);

    if (this.topLevelComments.length > 0) {
        // Hide excess topLevelComments
        qwery(this.getClass('topLevelComment'), this.elem).forEach(function(elem, i) {
            if (i >= initialShow) {
                self.hasHiddenComments = true;
                bonzo(elem).addClass('u-h');
            }
        });

        if (this.topLevelComments.length > initialShow) {
            if (!this.getElem('showMore')) {
                bonzo(this.getElem('comments')).append(
                    '<a class="js-show-more-comments cta" data-link-name="Show more comments" data-remove="true" href="/discussion'+
                        this.options.discussionId +'?page=1">'+
                        'Show more comments'+
                    '</a>');
            }
            this.on('click', this.getElem('showMore'), this.showMore);
        }

        this.hideExcessReplies();
        this.bindCommentEvents();
        this.on('click', this.getClass('showReplies'), this.showMoreReplies);
    }
    this.emit('ready');
};

Comments.prototype.bindCommentEvents = function() {
    RecommendComments.init(this.context);

    if (this.user && this.user.privateFields.canPostComment) {
        this.renderReplyButtons();
        this.on('click', this.getClass('commentReply'), this.replyToComment);
    }
};

Comments.prototype.renderReplyButtons = function(comments) {
    var actions,
        self = this;

    comments = comments || this.comments;

    comments.forEach(function(elem, i) {
        actions = qwery(self.getClass('commentActions'), elem)[0];
        bonzo(actions).append(
            '<div class="u-fauxlink d-comment__action '+ self.getClass('commentReply', true) +'" '+
            'role="button" comment-id="'+ elem.getAttribute('data-comment-id') +'">Reply</div>');
    });
};

/**
 * @param {Event} e
 */
Comments.prototype.showMore = function(e) {
    e.preventDefault();
    var showMoreButton = this.getElem('showMore');

    if (showMoreButton.getAttribute('data-disabled') === 'disabled') {
        return;
    }

    if (this.hasHiddenComments) {
        this.showHiddenComments();
    } else {
        showMoreButton.innerHTML = 'Loading…';
        showMoreButton.setAttribute('data-disabled', 'disabled');
        ajax({
            url: '/discussion'+ this.options.discussionId +'.json?page='+ (this.currentPage+1),
            type: 'json',
            method: 'get',
            crossOrigin: true
        }).then(this.commentsLoaded.bind(this));
    }
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
            // TODO: Don't like using d-thread,
            // perhaps enhance to d-thread--replies
            bonzo(qwery('.d-thread', elem)).append(
                '<li class="'+ self.getClass('showReplies', true) +' cta" data-link-name="Show more replies" data-is-ajax>Show '+
                    repliesToHide.length + ' more ' + (repliesToHide.length === 1 ? 'reply' : 'replies') +
                '</li>');
        }
    });
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

    this.renderReplyButtons(qwery(this.getClass('comment'), bonzo(comments).parent()));
    bonzo(this.getElem('comments')).append(comments);

    showMoreButton.innerHTML = 'Show more';
    showMoreButton.removeAttribute('data-disabled');

    this.hideExcessReplies(comments);

    RecommendComments.init(this.context);
    this.emit('loaded');
};

Comments.prototype.removeShowMoreButton = function() {
    bonzo(this.getElem('showMore')).remove();
};

/** @param {Event} e */
Comments.prototype.replyToComment = function(e) {
    var parentCommentEl, showRepliesElem,
        replyLink = e.currentTarget,
        replyToId = replyLink.getAttribute('comment-id'),
        replyToComment = qwery('#comment-'+ replyToId)[0],
        $replyToComment = bonzo(replyToComment),
        commentForm = new CommentBox(this.context, this.mediator, {
            discussionId: this.options.discussionId,
            premod: this.user.privateFields.isPremoderated,
            state: 'response',
            focus: true
        });

    // this is a bit toffee, but we don't have .parents() in bonzo
    parentCommentEl = $replyToComment.hasClass(this.getClass('topLevelComment', true)) ? $replyToComment[0] : $replyToComment.parent().parent()[0];

    // I don't like this, but UX says go
    showRepliesElem = qwery(this.getClass('showReplies'), parentCommentEl);
    if (showRepliesElem.length > 0) {
        showRepliesElem[0].click();
    }
    commentForm.render(parentCommentEl);
};

return Comments;


});