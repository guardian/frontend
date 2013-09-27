define([
    'ajax',
    'bean',
    'modules/component'
], function(
    ajax,
    bean,
    Component
) {

/**
 * @constructor
 * @extends Component
 */
function CommentBox(context, options) {
    this.context = context || document;
    for (var prop in options) {
        this.options[prop] = options[prop];
    }
}
Component.create(CommentBox);

/** @type {Object.<string.*>} */
CommentBox.CONFIG = {
    classes: {
        component: 'js-comment-box',
        body: 'd-comment-box__body',
        submitButton: 'd-comment-box__submit',
        errors: 'd-comment-box__errors',
        error: 'd-comment-box__error'
    },
    errors: {
        EMPTY_COMMENT_BODY: 'Please write a comment',
        COMMENT_TOO_LONG: 'Your comment must be fewer than 5000 characters long'
    }
};

/**
 * @type {Object.<string.*>}
 */
CommentBox.prototype.options = {
    maxLength: 5000,
    apiRoot: null
};

/**
 * @type {Array.<string>}
 */
CommentBox.prototype.errors = [];

/** @override */
CommentBox.prototype.ready = function() {
    if (this.elem.getAttribute('data-discussion-id') === null) {
        throw new Error('CommentBox: You need to set the "data-discussion-id" on your element');
    }

    var commentBody = this.getElem('body'),
        submitButton = this.getElem('submitButton');

    this.setFormState();

    bean.on(this.context, 'submit', [this.elem], this.postComment.bind(this));
    bean.on(this.context, 'change mousedown', [commentBody], this.setFormState.bind(this));
};

/**
 * @param {Event}
 */
CommentBox.prototype.postComment = function(e) {
    var comment = {
        body: this.getElem('body').value
    };

    e.preventDefault();
    this.errors = [];

    if (comment.body === '') {
        this.error('EMPTY_COMMENT_BODY');
    }

    else if (comment.body.length > this.options.maxLength) {
        this.error('COMMENT_TOO_LONG');
    }

    if (this.errors.length === 0) {
        var url = this.options.apiRoot +'/discussion/'+ this.getDiscussionId() +'/comment';

        return ajax({
            url: url,
            type: 'json',
            method: 'post',
            crossOrigin: true,
            headers: { 'D2-X-UID': 'zHoBy6HNKsk' }
        }).then(this.success.bind(this), this.fail.bind(this));
    }
};

/**
 * TODO (jamesgorrie): Perhaps change error states to use bit operators
 * @param {string} type
 */
CommentBox.prototype.error = function(type) {
    var error = document.createElement('div');
    error.className = this.getClass('error', true);
    error.innerHTML = this.getConf().errors[type];
    this.getElem('errors').appendChild(error);
    this.errors.push(type);
};

/**
 * @param {Object} resp
 */
CommentBox.prototype.success = function(resp) {
    if (resp.status === 'ok') {
        this.emit('success', { id: parseInt(resp.message, 10) });
    } else {
        this.fail();
    }
};

/**
 * @param {Reqwest=} resp (optional)
 */
CommentBox.prototype.fail = function(resp) {
    
};


/**
 * @return {string}
 */
CommentBox.prototype.getDiscussionId = function() {
    return this.elem.getAttribute('data-discussion-id');
};

/**
 * Set the form to be postable or not dependant on the comment
 */
CommentBox.prototype.setFormState = function() {
    var commentBody = this.getElem('body'),
        submitButton = this.getElem('submitButton');

    if (commentBody.value.length === 0 || commentBody.value.length > this.options.maxLength) {
        submitButton.setAttribute('disabled', 'disabled');
        this.elem.setAttribute('data-disabled', true);
    } else {
        submitButton.removeAttribute('disabled');
        this.elem.setAttribute('data-disabled', true);
    }
};

return CommentBox;

}); // define