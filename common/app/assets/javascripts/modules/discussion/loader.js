define([
    'ajax',
    'modules/component',
    'modules/discussion/api',
    'modules/discussion/comments',
    'modules/discussion/comment-box',
    'modules/id'
], function(
    ajax,
    Component,
    Comments,
    CommentBox,
    DiscussionApi,
    Id
) {

/**
 * @constructor
 */
var Loader = function(context, mediator) {
    this.context = context;
    this.mediator = mediator;
};
Component.define(Loader);

/**  */
Loader.prototype.context = null;

/** @type {Object.<string.*>} */
Loader.CONFIG = {
    componentClass: 'discussion',
    classes: {
        comments: 'discussion__comments',
        show: 'discussion__show'
    }
};

/** @type {Discussion} */
Loader.prototype.discussion = null;

/** @override */
Loader.prototype.ready = function() {
    // console.log('ready')
    var id = this.getDiscussionId();
    ajax({
        url: '/discussion'+ id + '.json',
        data: { size: 'small' },
    }).then(this.renderDiscussion.bind(this));
};

/**
 * @param {Object} resp
 */
Loader.prototype.renderDiscussion = function(resp) {
    var commentsElem = this.getElement('comments');

    // comments
    commentsElem.innerHTML = resp.html;
    this.comments = new Comments(this.context);
    this.comments.attachTo(commentsElem);

    // comment box
    this.commentBox = new CommentBox(this.context, this.mediator);
    this.commentBox.render();
};

/**
 * If discussion is closed -> render closed
 * If not signed in -> render signin,
 * Else render comment box
 */
Loader.prototype.renderCommentBar = function() {
    var discussionClosed = this.getDiscussionClosed(),
        user = Id.getUserFromCookie();

    if (discussionClosed) {
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
    // console.log('Closed');

};

/****/
Loader.prototype.renderSignin = function() {
    // console.log('Signin');
};

/****/
Loader.prototype.renderCommentBox = function() {
    var success = function(resp) {
        var user = resp.userProfile;
        // If this isn't in there, they're not the right person
        // More a sanity check than anything
        if (!user.privateFields) {
            this.renderSignin();
        } else if (!user.privateFields.canPostComment) {
            this.renderUserBanned();
        } else {
            var commentBox = new CommentBox(this.context, this.mediator);
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