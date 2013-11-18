define([
    'ajax',
    'bonzo',
    'qwery',
    'modules/component',
    'modules/id',
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

/**
 * TODO (jamesgorrie):
 * * Move recommending into this, it has no need for it's own module.
 * * Get the selectors up to date with BEM
 * @constructor
 * @extends Component
 * @param {Element=} context
 * @param {Object} mediator
 * @param {Object=} options
 */
var TopComments = function(context, mediator, options) {
    this.context = context || document;
    this.mediator = mediator;
    this.setOptions(options);
};
Component.define(TopComments);

/** @type {Object.<string.*>} */
TopComments.CONFIG = {
    endpoint: '/discussion/top:discussionId.json',
    classes: {
        comments: 'd-thread--top-level',
        topLevelComment: 'd-comment--top-level',
        showMore: 'js-show-more-top-comments',
        reply: 'd-comment--response',
        showReplies: 'js-show-more-replies',

        comment: 'd-comment',
        commentActions: 'd-comment__actions__main',
        commentReply: 'd-comment__action--reply',

        topCommentHolder: 'discussion__comments__top',
        titleCounter: 'discussion__comments__top__counter',
        fadeOut: 'd-image-fade'
    }
};

/** @type {Object.<string.*>} */
TopComments.prototype.defaultOptions = {
    discussionId: null,
    heightLimit: 600, // max-height in _discussion.scss .discussion__comments__top
    showRepliesCount: 3,
    user: null
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
        endpoint = this.conf().endpoint,
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

            // self.elem = parent;
            
            if (resp.commentCount > 0) {
                // Render Top Comments
                self.elem = bonzo.create(resp.html);
                $('.discussion__comments__top', parent).append(self.elem); // refactor
                self.elem = self.elem[0];
                self.elems = {};
                self.prerender();
                self.ready();

                self.mediator.emit("loadComments", { amount: 0 });
            } else {

                $('.discussion__comments__top__container').remove();

                // Render Regular Comments
                self.mediator.emit("loadComments", { amount: 3 });
            }
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

        $('.d-image-fade', self.elem).removeClass('u-h'); // refactor

        var showMoreButton = [];

        showMoreButton.push('<a class="js-show-more-top-comments cta" data-link-name="Show more top comments" data-remove="true" href="/discussion');
        showMoreButton.push(self.options.discussionId);
        showMoreButton.push('?page=1">');
        showMoreButton.push('Show more top comments');
        showMoreButton.push('</a>');

        if (!self.showMoreButton) {
            self.showMoreButton = bonzo(showMoreButton.join(''));
            bonzo(self.elem).append(self.showMoreButton[0]);
            self.showMoreButton = qwery(self.getClass('showMore'))[0];
        }
        self.on('click', self.showMoreButton, self.showMore);
    }

    // if (this.topLevelComments.length > 0) {
    //     // Hide excess topLevelComments
    //     qwery(this.getClass('topLevelComment'), this.elem).forEach(function(elem, i) {
    //         if (i >= initialShow) {
    //             self.hasHiddenComments = true;
    //             bonzo(elem).addClass('u-h');
    //         }
    //     });

    //     if (this.topLevelComments.length > initialShow) {
    //         if (!this.getElem('showMore')) {
    //             bonzo(this.getElem('comments')).append(
    //                 '<a class="js-show-more-comments cta" data-link-name="Show more comments" data-remove="true" href="/discussion'+
    //                     this.options.discussionId +'?page=1">'+
    //                     'Show more comments'+
    //                 '</a>');
    //         }
    //         this.on('click', this.getElem('showMore'), this.showMore);
    //     }

    //     this.hideExcessReplies();
    //     this.bindCommentEvents();
    //     this.on('click', this.getClass('showReplies'), this.showMoreReplies);
    // }
    
    // Append top comment count to section title
   $(self.getClass('titleCounter')).removeClass('u-h')[0].innerHTML = "(" + self.topLevelComments.length + ")";

    self.emit('ready');
};

TopComments.prototype.bindCommentEvents = function() {
    RecommendComments.init(this.context);

    if (this.user && this.user.privateFields.canPostComment) {
        this.renderReplyButtons();
        this.on('click', this.getClass('commentReply'), this.replyToComment);
    }
};

TopComments.prototype.renderReplyButtons = function(comments) {
    var actions,
        self = this;

    comments = comments || this.comments;

    comments.forEach(function(elem, i) {
        actions = qwery(self.getClass('commentActions'), elem)[0];
        bonzo(actions).prepend(
            '<div class="u-fauxlink d-comment__action '+ self.getClass('commentReply', true) +'" '+
            'role="button" data-link-name="reply to comment" data-comment-id="'+ elem.getAttribute('data-comment-id') +'">Reply</div>');
    });
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
    // Still needed?
    // else {
    //     showMoreButton.innerHTML = 'Loading…';
    //     showMoreButton.setAttribute('data-disabled', 'disabled');
    //     ajax({
    //         url: '/discussion'+ this.options.discussionId +'.json?page='+ (this.currentPage+1),
    //         type: 'json',
    //         method: 'get',
    //         crossOrigin: true
    //     }).then(this.commentsLoaded.bind(this));
    // }
};

TopComments.prototype.showHiddenComments = function() {

    $('.discussion__comments__top', this.elem).css("max-height", "none"); // refactor

    this.hasHiddenComments = false;

    this.showMoreButton.remove();

    $('.d-image-fade', this.elem).remove(); // refactor

    // this.emit('first-load'); ????
};

/**
 * @param {Object} resp
 */
// TopComments.prototype.commentsLoaded = function(resp) {
//     var comments = qwery(this.getClass('topLevelComment'), bonzo.create(resp.html)),
//         showMoreButton = this.getElem('showMore');

//     this.currentPage++;
//     if (!resp.hasMore) {
//         this.removeShowMoreButton();
//     }

//     this.renderReplyButtons(qwery(this.getClass('comment'), bonzo(comments).parent()));
//     bonzo(this.getElem('comments')).append(comments);

//     showMoreButton.innerHTML = 'Show more';
//     showMoreButton.removeAttribute('data-disabled');

//     this.hideExcessReplies(comments);

//     RecommendComments.init(this.context);
//     this.emit('loaded');
// };

/**
 * @param {object.<string.*>} comment
 * @param {Boolean=} focus (optional)
 * @param {Element=} parent (optional)
 */
TopComments.prototype.addComment = function(comment, focus, parent) {
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
            body: '<p>'+ comment.body.replace('\n', '</p><p>') +'</p>',
            report: {
                href: 'http://discussion.theguardian.com/components/report-abuse/'+ comment.id
            },
            avatar: {
                src: this.user.avatar
            }
        },
        commentElem = bonzo.create(document.getElementById('tmpl-comment').innerHTML)[0];

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
