define([
    'bean',
    'bonzo',
    'modules/discussion/api',
    'modules/component'
], function(
    bean,
    bonzo,
    DiscussionApi,
    Component
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
    bodyExpanded: 'd-comment-box__body--expanded'
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
    API_ERROR: 'Sorry, there was a problem posting your comment.'
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
    replyTo: null,
    cancelable: false
};

/**
 * @type {Array.<string>}
 */
CommentBox.prototype.errors = [];

/** @oevrride */
CommentBox.prototype.prerender = function() {
    if (!this.options.premod) {
        this.getElem('premod').parentNode.removeChild(this.getElem('premod'));
    }

    if (this.options.state === 'response') {
        this.getElem('submit').innerHTML = 'Post reply';
    }

    if (this.options.replyTo) {
        var elem = document.createElement('label');
        elem.setAttribute('for', 'reply-to-'+ this.options.replyTo.commentId);
        elem.className = 'label '+ this.getClass('reply-to', true);
        elem.innerHTML = 'to '+ this.options.replyTo.author;
        this.getElem('body').id = 'reply-to-'+ this.options.replyTo.commentId;
        bonzo(elem).insertAfter(this.getElem('submit'));
    }

    if (this.options.cancelable) {
        var beforeElem = this.getElem('reply-to') ? this.getElem('reply-to') : this.getElem('submit');
        bonzo(bonzo.create('<div class="u-fauxlink '+ this.getClass('cancel', true) +'" role="button">Cancel</div>')).insertAfter(beforeElem);
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
    this.on('click', this.getClass('cancel'), this.destroy);

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
    this.getElem('messages').innerHTML = '';
    this.errors = [];

    if (comment.body === '') {
        this.error('EMPTY_COMMENT_BODY');
    }

    else if (comment.body.length > this.options.maxLength) {
        this.error('COMMENT_TOO_LONG', '<b>Comments must be shorter than '+ this.options.maxLength +' characters.</b> Yours is currently '+ (comment.body.length-this.options.maxLength) +' characters too long.');
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
    var error = document.createElement('div');
    error.className = this.getClass('error', true);
    error.innerHTML = message || this.errorMessages[type];
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

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.setExpanded = function(e) {
    this.setState('expanded', 'body');
};


return CommentBox;

}); // define