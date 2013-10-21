define([
    'ajax',
    'bonzo',
    'qwery',
    'modules/component',
    'modules/discussion/api',
    'modules/discussion/comments',
    'modules/discussion/comment-box',
    'modules/id'
], function(
    ajax,
    bonzo,
    qwery,
    Component,
    DiscussionApi,
    Comments,
    CommentBox,
    Id
) {

/**
 * @constructor
 * @extends Component
 * @param {Element=} context
 * @param {Object} mediator
 * @param {Object=} options
 */
var Loader = function(context, mediator, options) {
    this.context = context || document;
    this.mediator = mediator;
    this.setOptions(options);
};
Component.define(Loader);

/**  */
Loader.prototype.context = null;

/** @type {Object.<string.*>} */
Loader.CONFIG = {
    componentClass: 'discussion',
    classes: {
        comments: 'discussion__comments',
        commentBox: 'discussion__comment-box',
        show: 'd-show-cta'
    }
};

/** @type {Comments} */
Loader.prototype.comments = null;

/** @type {CommentBox} */
Loader.prototype.commentBox = null;

/** @override */
Loader.prototype.ready = function() {
    var id = this.getDiscussionId();

    // TODO: Move this into the Comments module
    this.getElem('comments').innerHTML = '<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>';
    ajax({
        url: '/discussion'+ id + '.json'
    }).then(this.renderDiscussion.bind(this));
    bonzo(this.getElem('show')).remove();
};

/**
 * @param {Object} resp
 */
Loader.prototype.renderDiscussion = function(resp) {
    var commentsElem = this.getElem('comments');

    // comments
    commentsElem.innerHTML = resp.html;
    this.comments = new Comments(this.context, this.mediator, {
        initialShow: 2,
        discussionId: this.getDiscussionId()
    });
    this.comments.attachTo(commentsElem);

    this.renderCommentBar();
};

/**
 * If discussion is closed -> render closed
 * If not signed in -> render signin,
 * Else render comment box
 */
Loader.prototype.renderCommentBar = function() {
    var user = Id.getUserFromCookie();

    if (this.getDiscussionClosed()) {
        this.renderDiscussionClosedMessage();
    } else if (!user) {
        this.renderSignin();
    } else {
        this.renderCommentBox();
    }
};

/**
 *
 */
Loader.prototype.renderDiscussionClosedMessage = function() {
    
};

/****/
Loader.prototype.renderSignin = function() {
    
};

/****/
Loader.prototype.renderCommentBox = function() {
    // This is a bit of a hack for now
    // We'll move the rendering to the play app once we
    // have the discussion stack up that can read cookies
    var success = function(resp) {
        var user = resp.userProfile;
        // If this privateFields aren't there,
        // they're not the right person
        // More a sanity check than anything
        if (!user.privateFields) {
            this.renderSignin();
        } else if (!user.privateFields.canPostComment) {
            this.renderUserBanned();
        } else {
            this.commentBox = new CommentBox(this.context, this.mediator, {
                discussionId: this.getDiscussionId()
            });
            this.commentBox.render(this.getElem(''));
            if (!user.privateFields.isPremoderated) {
                bonzo(qwery('.d-comment-box__premod'), this.commentBox.elem).remove();
            }
        }
    };

    DiscussionApi
        .getUser()
        .then(success.bind(this));
};

/**
 * @return {string}
 */
Loader.prototype.getDiscussionId = function() {
    return this.elem.getAttribute('data-discussion-id');
};

/**
 * @return {boolean}
 */
Loader.prototype.getDiscussionClosed = function() {
    return this.elem.getAttribute('data-discussion-closed') === 'true';
};

return Loader;

}); //define