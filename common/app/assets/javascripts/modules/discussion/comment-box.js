define(['modules/component'], function(Component) {

/**
 * @constructor
 * @extends Component
 */
function CommentBox(opts) {
    this.init(opts);
};
Component.create(CommentBox);

/** @override */
CommentBox.prototype.ready = function() {
    this.on('.js-comment-box', 'submit', this.addComment);
};

CommentBox.prototype.addComment = function(e) {
    e.preventDefault();

    var formEl = e.currentTarget,
        comment = {
            body: formEl.elements.body.value
        };
};

return CommentBox;



});