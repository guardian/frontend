define(['modules/discussion/comment-box'], function(CommentBox) {

var commentBox = new CommentBox();
var commentBoxElem = document.createElement('div');
commentBoxElem.id = 'comment-box';
commentBoxElem.innerHTML = '<form action="" method="post" class="js-comment-box"><textarea name="body">Here is a comment</textarea><button type="submit">Submit</button></form>';
document.getElementById('update-area').appendChild(commentBoxElem);

// test rendering of item added to page
commentBox.render(commentBoxElem);




});