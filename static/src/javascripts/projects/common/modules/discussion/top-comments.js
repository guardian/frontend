define([
    'bonzo',
    'qwery',

    'common/utils/$',
    'common/utils/ajax',
    
    'common/modules/component'
], function(
    bonzo,
    qwery,
    $,
    ajax,
    Component
) {

var TopComments = function(options) {
    this.setOptions(options);

    this.fetchData = {
        topComments: true
    };
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
    showReplies: 'd-show-more-replies',

    topCommentTitle: 'page-sub-header',

    comment: 'd-comment',
    commentActions: 'd-comment__actions__main',
    commentReply: 'd-comment__action--reply',

    showMoreFeatured: 'show-more__container--featured',
    showMoreFeaturedButton: 'js-show-more-top-comments',

    topCommentsContainer: 'discussion__comments__top',
    fadeOut: 'd-image-fade'
};

/**
 * @type {string}
 * @override
 */
TopComments.prototype.endpoint = '/discussion/:discussionId.json';

/** @type {Object.<string.*>} */
TopComments.prototype.defaultOptions = {
    discussionId: null,
    showRepliesCount: 3,
    sectionHeading: 'Featured Comments '
};

/** @type {number} */
TopComments.prototype.currentPage = 1;

/** @type {NodeList=} */
TopComments.prototype.comments = null;

/** @type {NodeList=} */
TopComments.prototype.topLevelComments = null;

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
        crossOrigin: true,
        data: this.fetchData
    }).then(
        function render(resp) {
            if (resp.currentCommentCount > 0) {
                // Render Top Comments
                self.topCommentsAmount = resp.currentCommentCount;
                self.parent = parent;
                self.elem = bonzo.create(resp.html);
                $(self.getClass('topCommentsContainer'), parent).append(self.elem);
                self.elem = self.elem[0];
                self.elems = {};
                self.prerender();
                self.ready();
            } else {
                $('.discussion__comments--top-comments').remove();
            }
        },
        function () {
            $('.discussion__comments--top-comments').remove();
        }
    );
};

/** @override */
TopComments.prototype.ready = function() {
    var self = this;

    // Ease of use
    this.topLevelComments = qwery(this.getClass('topLevelComment'), this.elem);
    this.comments = qwery(this.getClass('comment'), this.elem);
    this.commentsContainer = qwery(this.getClass('comments'), this.elem)[0];
    this.rendered = true;

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
       $(self.getClass('titleCounter')).removeClass('u-h')[0].innerHTML = '(' + self.topCommentsAmount + ')';
    }

    self.emit('ready');
};

TopComments.prototype.truncateFeatured = function(maxHeight){
    $('.d-image-fade', this.parent).removeClass('u-h');
    $(this.getClass('showMoreFeatured'), this.elem).removeClass('u-h');
    $(this.commentsContainer).css('max-height', maxHeight + 'px');
};

TopComments.prototype.showAllFeatured = function(e) {
    if (e) { e.preventDefault(); }
    $('.d-image-fade', this.parent).addClass('u-h');
    $(this.getClass('showMoreFeatured'), this.elem).addClass('u-h');
    $(this.commentsContainer).css('max-height', 'none');
};

return TopComments;

});
