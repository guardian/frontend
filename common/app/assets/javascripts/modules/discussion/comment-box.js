define(['modules/component', 'ajax'], function(Component, ajax) {

/**
 * @constructor
 * @extends Component
 */
function CommentBox(opts) {}
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

    // ajax()
};

return CommentBox;

}); // define