define([
    'bean',
    'bonzo',
    'common/modules/discussion/api',
    'common/modules/identity/api',
    'common/modules/component',
    'common/modules/discussion/user-avatars'
], function(
    bean,
    bonzo,
    DiscussionApi,
    IdentityApi,
    Component,
    UserAvatars
) {

/**
 * @constructor
 * @extends Component
 * @param {Element=} context
 * @param {Object} mediator
 * @param {Object=} options
 */
function CommentBox(context, mediator, options) {
    this.context = context || document;
    this.mediator = mediator;
    this.setOptions(options);

    mediator.on('module:identity:validation-email:success', this.verificationEmailSuccess.bind(this));
    mediator.on('module:identity:validation-email:fail', this.verificationEmailFail.bind(this));
}
Component.define(CommentBox);

/**
 * @type {boolean}
 * @override
 */
CommentBox.prototype.useBem = true;

/**
 * @type {string}
 * @override
 */
CommentBox.prototype.templateName = 'comment-box';

/**
 * @type {string}
 * @override
 */
CommentBox.prototype.componentClass = 'd-comment-box';

/**
 * @type {Object.<string.string>}
 * @override
 */
CommentBox.prototype.classes = {
};

/**
 * @type {Object.<string.string>}
 * @override
 */
CommentBox.prototype.errorMessages = {
    EMPTY_COMMENT_BODY: 'Please write a comment.',
    COMMENT_TOO_LONG: 'Your comment must be fewer than 5000 characters long.',
    ENHANCE_YOUR_CALM: 'You can only post one comment every minute. Please try again in a moment.',
    USER_BANNED: 'Commenting has been disabled for this account (<a href="/community-faqs#321a">why?</a>).',
    API_ERROR: 'Sorry, there was a problem posting your comment.',
    EMAIL_VERIFIED: '<span class="d-comment-box__error-meta">Sent. Please check your email to verify '+
        (IdentityApi.getUserFromCookie() ? IdentityApi.getUserFromCookie().primaryEmailAddress : ' your email address') +'</span>.',
    EMAIL_VERIFIED_FAIL: 'We are having technical difficulties. Please try again later or '+
        '<a href="/send/email" class="js-id-send-validation-email"><strong>resend the verification</strong></a>.',
    EMAIL_NOT_VERIFIED: 'Please confirm your email address to post your first comment.<br />'+
        '<a href="_#" class="js-id-send-validation-email"><strong>Send verification email</strong></a><span class="d-comment-box__error-meta"> to '+
        (IdentityApi.getUserFromCookie() ? IdentityApi.getUserFromCookie().primaryEmailAddress : ' your email address') + '.</span>'
};

/**
 * @type {Object.<string.*>}
 */
CommentBox.prototype.defaultOptions = {
    discussionId: null,
    apiRoot: null,
    maxLength: 5000,
    premod: false,
    focus: false,
    state: 'top-level',
    replyTo: null
};

/**
 * @type {Array.<string>}
 */
CommentBox.prototype.errors = [];

CommentBox.prototype.getUserData = function() {
    return IdentityApi.getUserFromCookie();
};

/** @override */
CommentBox.prototype.prerender = function() {
    if (!this.options.premod) {
        this.getElem('premod').parentNode.removeChild(this.getElem('premod'));
    }

    var userData = this.getUserData();

    this.getElem('author').innerHTML = userData.displayName;

    if (this.options.state === 'response') {
        this.getElem('submit').innerHTML = 'Post reply';
    } else {
        var avatar = this.getElem('avatar-wrapper');
        avatar.setAttribute('userid', userData.id);
        UserAvatars.avatarify(avatar);
    }

    if (this.options.replyTo) {
        var replyToAuthor = this.getElem('reply-to-author');
        replyToAuthor.innerHTML = this.options.replyTo.author;
        this.getElem('parent-comment-author').innerHTML = this.options.replyTo.author + " @ " + this.options.replyTo.timestamp + " said:";

        this.getElem('parent-comment-body').innerHTML = this.options.replyTo.body;

        var setSpoutMargin = function() {
            var spoutOffset = replyToAuthor.offsetLeft + (replyToAuthor.getBoundingClientRect().width/2);
            this.getElem('parent-comment-spout').style.marginLeft = spoutOffset + 'px';
        };
        window.setTimeout(setSpoutMargin.bind(this), 0);

    }

};

/** @override */
CommentBox.prototype.ready = function() {
    if (this.getDiscussionId() === null) {
        throw new Error('CommentBox: You need to set the "data-discussion-key" on your element');
    }

    var commentBody = this.getElem('body'),
        submitButton = this.getElem('submit');

    this.setFormState();

    // TODO (jamesgorrie): Could definitely use the this.on and make the default context this
    bean.on(this.context, 'submit', [this.elem], this.postComment.bind(this));
    bean.on(this.context, 'change keyup', [commentBody], this.setFormState.bind(this));
    bean.on(commentBody, 'focus', this.setExpanded.bind(this)); // this isn't delegated as bean doesn't support it
    this.on('click', this.getClass('cancel'), this.cancelComment);
    this.on('click', this.getClass('show-parent'), this.setState.bind(this, 'parent-visible', false));
    this.on('click', this.getClass('hide-parent'), this.removeState.bind(this, 'parent-visible', false));

    this.setState(this.options.state);

    if (this.options.focus) {
        this.getElem('body').focus();
    }
};

/**
 * @param {Event}
 */
CommentBox.prototype.postComment = function(e) {
    var body = this.getElem('body'),
        comment = {
            body: this.getElem('body').value
        };

    e.preventDefault();
    this.clearErrors();

    if (comment.body === '') {
        this.error('EMPTY_COMMENT_BODY');
    }

    else if (comment.body.length > this.options.maxLength) {
        this.error('COMMENT_TOO_LONG', '<b>Comments must be shorter than '+ this.options.maxLength +' characters.</b>'+
            'Yours is currently '+ (comment.body.length-this.options.maxLength) +' characters too long.');
    }

    if (this.options.replyTo) {
        comment.replyTo = this.options.replyTo;
    }

    if (this.errors.length === 0) {
        this.setFormState(true);
        DiscussionApi
            .postComment(this.getDiscussionId(), comment)
            .then(this.success.bind(this, comment), this.fail.bind(this));
    }
};

/**
 * TODO (jamesgorrie): Perhaps change error states to use bit operators
 * @param {string} type
 * @param {string} message Overrides the default message
 */
CommentBox.prototype.error = function(type, message) {
    message = message || this.errorMessages[type];

    this.setState('invalid');
    var error = bonzo.create(
        '<div class="d-discussion__error '+ this.getClass('error', true) +'">'+
            '<i class="i i-alert"></i>'+
            '<span class="d-discussion__error-text">'+ message +'</span>'+
        '</div>'
    )[0];
    this.getElem('messages').appendChild(error);
    this.errors.push(type);
};

/**
 * @param {Object} comment
 * @param {Object} resp
 */
CommentBox.prototype.success = function(comment, resp) {
    comment.id = parseInt(resp.message, 10);
    this.getElem('body').value = '';
    this.setFormState();
    this.emit('post:success', comment);
    this.mediator.emit('discussion:commentbox:post:success', comment);
};

/**
 * TODO (jamesgorrie); Make this more robust
 * @param {Reqwest=} resp (optional)
 */
CommentBox.prototype.fail = function(xhr) {
    var response;
    // if our API is down, it returns HTML
    // this is not so good for JSON.parse
    try { response = JSON.parse(xhr.responseText); }
        catch (e) { response = {}; }

    this.setFormState();

    if (xhr.status === 420) {
        this.error('ENHANCE_YOUR_CALM');
    } else if (this.errorMessages[response.errorCode]) {
        this.error(response.errorCode);
    } else {
        this.error('API_ERROR');
    }
};

/**
 * TODO: remove the replace, get the Scala to be better
 * @return {string}
 */
CommentBox.prototype.getDiscussionId = function() {
    return this.options.discussionId || this.elem.getAttribute('data-discussion-key').replace('discussion', '');
};

/**
 * Set the form to be postable or not dependant on the comment
 * @param {Boolean|Event=} disabled (optional)
 */
CommentBox.prototype.setFormState = function(disabled) {
    disabled = typeof disabled === 'boolean' ? disabled : false;

    var commentBody = this.getElem('body'),
        submitButton = this.getElem('submit');

    if (disabled || commentBody.value.length === 0) {
        submitButton.setAttribute('disabled', 'disabled');
    } else {
        submitButton.removeAttribute('disabled');
    }
};

CommentBox.prototype.clearErrors = function() {
    this.getElem('messages').innerHTML = '';
    this.errors = [];
    this.removeState('invalid');
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.setExpanded = function(e) {
    this.setState('expanded');
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.verificationEmailSuccess = function(e) {
    this.clearErrors();
    this.error('EMAIL_VERIFIED');
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.verificationEmailFail = function(e) {
    this.clearErrors();
    this.error('EMAIL_VERIFIED_FAIL');
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.cancelComment = function(e) {
    if (this.options.state === 'response') {
        this.destroy();
    } else {
        this.getElem('body').value = '';
        this.setFormState();
        this.removeState('expanded');
    }
};

return CommentBox;

}); // define
