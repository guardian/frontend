define([
    'ajax',
    'bonzo',
    'qwery',
    'modules/component',
    'modules/discussion/recommend-comments'
], function(
    ajax,
    bonzo,
    qwery,
    Component,
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
    endpoint: '/discussion/:discussionId.json',
    classes: {
        comments: 'd-thread--top-level',
        topLevel: 'd-comment--top-level',
        showMore: 'js-show-more-comments',
        reply: 'd-comment--response'
    }
};

/** @type {Object.<string.*>} */
Comments.prototype.defaultOptions = {
    discussionId: null,
    initialShow: 10,
    showRepliesCount: 3
};

/** @type {Boolean} */
Comments.prototype.hasHiddenComments = false;

/** @type {number} */
Comments.prototype.currentPage = 1;

/** @type {NodeList=} */
Comments.prototype.comments = null;

/** @override */
Comments.prototype.ready = function() {
    var initialShow = this.options.initialShow,
        topLevelComments = qwery(this.getClass('topLevel'), this.elem),
        hasComments = topLevelComments.length > 0,
        self = this;

    if (hasComments) {
        // Hide excess topLevelComments
        qwery(this.getClass('topLevel'), this.elem).forEach(function(elem, i) {
            if (i >= initialShow) {
                self.hasHiddenComments = true;
                bonzo(elem).addClass('u-h');
            }
        });

        if (topLevelComments.length > initialShow) {
            if (!this.getElem('showMore')) {
                bonzo(this.getElem('comments')).append(
                    '<a class="js-show-more-comments cta" data-link-name="Show more comments" data-remove="true" href="/discussion'+
                        this.options.discussionId +'?page=1">'+
                        'Show more comments'+
                    '</a>');
            }
            this.on('click', this.getElem('showMore'), this.showMore);
        }

        this.on('click', '.js-show-more-replies', this.showMoreReplies);
        this.hideExcessReplies();
        RecommendComments.init(this.context);
    }
    this.emit('ready');
};

Comments.prototype.bindCommentEvents = function() {

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
    qwery(this.getClass('topLevel'), this.elem).forEach(function(elem, i) {
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

    comments = comments || qwery(this.getClass('topLevel'), this.elem);
    comments.forEach(function(elem, i) {
        replies = qwery(self.getClass('reply'), elem);

        if (replies.length > self.options.showRepliesCount) {
            repliesToHide = replies.slice(self.options.showRepliesCount, replies.length);
            bonzo(repliesToHide).attr('hidden', 'hidden');
            // TODO: Don't like using d-thread,
            // perhaps enhance to d-thread--replies
            bonzo(qwery('.d-thread', elem)).append(
                '<li class="js-show-more-replies cta" data-link-name="Show more replies" data-is-ajax>Show '+
                    repliesToHide.length + ' more ' + (repliesToHide.length === 1 ? 'reply' : 'replies') +
                '</li>');
        }
    });
};

/**
 * @param {Object} resp
 */
Comments.prototype.commentsLoaded = function(resp) {
    var comments = qwery(this.getClass('topLevel'), bonzo.create(resp.html)),
        showMoreButton = this.getElem('showMore');

    this.currentPage++;
    if (!resp.hasMore) {
        this.removeShowMoreButton();
    }
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

return Comments;


});