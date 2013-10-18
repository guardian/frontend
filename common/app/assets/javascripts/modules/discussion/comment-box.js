define([
    'bean',
    'modules/discussion/api',
    'modules/component',
], function(
    bean,
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

/** @type {Object.<string.*>} */
CommentBox.CONFIG = {
    templateName: 'comment-box',
    componentClass: 'js-comment-box',
    containerClass: 'discussion__comment-box',
    classes: {
        show: 'js-show-comment-box',
        body: 'd-comment-box__body',
        bodyExpanded: 'd-comment-box__body--expanded',
        submitButton: 'd-comment-box__submit',
        messages: 'd-comment-box__messages',
        error: 'd-comment-box__error',
        condensed: 'd-comment-box--condensed'
    },
    errors: {
        EMPTY_COMMENT_BODY: 'Please write a comment.',
        COMMENT_TOO_LONG: 'Your comment must be fewer than 5000 characters long.',
        ENHANCE_YOUR_CALM: 'You can only post one comment every minute. Please try again in a moment.',
        USER_BANNED: 'Commenting has been disabled for this account (<a href="/community-faqs#321a">why?</a>).',
        API_ERROR: 'Sorry, there was a problem posting your comment.'
    }
};

/**
 * @type {Object.<string.*>}
 */
CommentBox.prototype.defaultOptions = {
    discussionId: null,
    apiRoot: null,
    condensed: false,
    maxLength: 5000
};

/**
 * @type {Array.<string>}
 */
CommentBox.prototype.errors = [];

/** @override */
CommentBox.prototype.ready = function() {
    if (this.getDiscussionId() === null) {
        throw new Error('CommentBox: You need to set the "data-discussion-id" on your element');
    }

    var commentBody = this.getElem('body'),
        submitButton = this.getElem('submitButton');

    this.setFormState();

    // TODO (jamesgorrie): Could definitely use the this.on and make the default context this
    bean.on(this.context, 'submit', [this.elem], this.postComment.bind(this));
    bean.on(this.context, 'change keyup', [commentBody], this.setFormState.bind(this));
    bean.on(commentBody, 'focus', this.setExpanded.bind(this)); // this isn't delegated as bean doesn't support it

    if (this.options.condensed) {
        this.elem.className = this.elem.className +' '+ this.getClass('condensed', true);
        bean.on(this.context, 'click', [this.getElem('show')], this.showCommentBox.bind(this));
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
    error.innerHTML = message || this.conf().errors[type];
    this.getElem('messages').appendChild(error);
    this.errors.push(type);
};

/**
* @param {Object} comment
 * @param {Object} resp
 */
CommentBox.prototype.success = function(comment, resp) {
    this.getElem('body').value = '';
    this.setFormState();
    this.emit('post:success', comment);
    this.mediator.emit('discussion:commentbox:post:success', resp);
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
    } else if (this.conf().errors[response.errorCode]) {
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
    return this.options.discussionId || this.elem.getAttribute('data-discussion-id').replace('discussion', '');
};

/**
 * Set the form to be postable or not dependant on the comment
 * @param {Boolean|Event=} disabled (optional)
 */
CommentBox.prototype.setFormState = function(disabled) {
    disabled = typeof disabled === 'boolean' ? disabled : false;

    var commentBody = this.getElem('body'),
        submitButton = this.getElem('submitButton');

    if (disabled || commentBody.value.length === 0) {
        submitButton.setAttribute('disabled', 'disabled');
    } else {
        submitButton.removeAttribute('disabled');
    }
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.showCommentBox = function(e) {
    var condensedClass = this.getClass('condensed', true);

    if (this.elem.className.match(condensedClass)) {
        this.elem.className = this.elem.className.replace(condensedClass, '');
        this.getElem('body').focus();
    }
};

/**
 * @param {Event=} e (optional)
 */
CommentBox.prototype.setExpanded = function(e) {
    var commentBody = this.getElem('body'),
        expandedClass = this.getClass('bodyExpanded', true);

    if (!commentBody.className.match(expandedClass)) {
        commentBody.className = commentBody.className +' '+ expandedClass;
    }
};


return CommentBox;

}); // define