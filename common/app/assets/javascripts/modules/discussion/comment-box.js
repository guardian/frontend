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
        component: 'js-comment-box'
    }
};

/** @override */
CommentBox.prototype.ready = function() {
    bean.on(this.context, 'submit', [this.elem], this.postComment.bind(this));
};


CommentBox.prototype.postComment = function(e) {
    // console.log('submit')
    e.preventDefault();
};

return CommentBox;

}); // define