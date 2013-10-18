define([
    'ajax',
    'modules/component',
    'moduels/discussion/api',
    'modules/id'
], function(
    ajax,
    Component,
    DiscussionApi,
    Id
) {

/**
 * @constructor
 */
var Loader = function(context) {
    this.context = context;
};
Component.define(Loader);

/**  */
Loader.prototype.context = null;

/** @type {Object.<string.*>} */
Loader.CONFIG = {
    classes: {
        component: 'js-show-discussion'
    }
};

/** @override */
Loader.prototype.ready = function() {
    var id = this.getDiscussionId();
    ajax({
        url: '/discussion'+ id + '.json',
        data: { size: 'small' },
    }).then(this.renderFirstComment.bind(this));
};

/**
 * @param {Object} resp
 */
Loader.prototype.renderFirstComment = function(resp) {
    this.context.querySelector('.article__discussion').innerHTML = resp.html;
    this.renderReadFullDiscussion();
    this.renderCommentBar();
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
        this.renderDiscussionClosed();
    } else if (!user) {
        this.renderSignin();
    } else {
        this.renderCommentBox();
    }
};

/**
 *
 */
Loader.prototype.renderDiscussionClosed = function() {
    // console.log('Closed');

};

/****/
Loader.prototype.renderSignin = function() {
    // console.log('Signin');
};

/****/
Loader.prototype.renderCommentBox = function() {
    DiscussionApi
        .getUser()
        .then();
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