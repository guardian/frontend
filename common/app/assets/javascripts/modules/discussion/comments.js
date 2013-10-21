define([
    'ajax',
    'bonzo',
    'qwery',
    'modules/component'
], function(
    ajax,
    bonzo,
    qwery,
    Component
) {

/**
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
    classes: {
        comments: 'd-thread--top-level',
        topLevel: 'd-comment--top-level',
        showMore: 'js-show-more-comments'
    }
};

/** @type {Object.<string.*>} */
Comments.prototype.defaultOptions = {
    discussionId: null,
    initialShow: 10
};

/** @type {Boolean} */
Comments.prototype.hasHiddenComments = false;

/** @type {number} */
Comments.prototype.currentPage = 1;

/** @override */
Comments.prototype.ready = function() {
    var initialShow = this.options.initialShow,
        topLevelComments = qwery(this.getClass('topLevel'), this.elem),
        hasComments = topLevelComments.length > 0,
        self = this;

    if (hasComments) {
        qwery(this.getClass('topLevel'), this.elem).forEach(function(elem, i) {
            if (i >= initialShow) {
                self.hasHiddenComments = true;
                elem.className += elem.className +' u-h';
            }
        });
        this.on('click', this.getElem('showMore'), this.showMore);
    } else {
        this.renderNoCommentsMessage();
    }
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
        }).then(this.commentsLoaded.bind(this));
    }
};

Comments.prototype.showHiddenComments = function() {
    qwery(this.getClass('topLevel'), this.elem).forEach(function(elem, i) {
        elem.className += elem.className.replace(' u-h', '');
    });
    this.hasHiddenComments = false;
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
};

/****/
Comments.prototype.removeShowMoreButton = function() {
    bonzo(this.getElem('showMore')).remove();
};


Comments.prototype.renderShowFirstCommentsButton = function() {

};

Comments.prototype.renderNoCommentsMessage = function() {

};

return Comments;


});