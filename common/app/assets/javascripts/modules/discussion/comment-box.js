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
    maxLength: 5000
};

/** @override */
CommentBox.prototype.ready = function() {
    bean.on(this.context, 'submit', [this.elem], this.postComment.bind(this));
};

/**
 * @param {Event}
 */
CommentBox.prototype.postComment = function(e) {
    e.preventDefault();
    var comment = {
        body: this.getElem('body').value
    };

    if (comment.body === '') {
        this.error('EMPTY_COMMENT_BODY');
    }

    else if (comment.body.length > this.options.maxLength) {
        this.error('COMMENT_TOO_LONG');
    }
};

/**
 * @param {string} type
 */
CommentBox.prototype.error = function(type) {
    var error = document.createElement('div');
    error.className = this.getClass('error', true);
    error.innerHTML = this.getConf().errors[type];
    this.getElem('errors').appendChild(error);
};

return CommentBox;

}); // define