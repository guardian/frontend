define([
    'common',
    'ajax',
    'bean',
    'helpers/fixtures',
    'modules/discussion/comment-box'
], function(
    common,
    ajax,
    bean,
    fixtures,
    CommentBox
) {
    describe('Comment box', function() {
        var context, server, loader,
            fixturesId = 'comment-box',
            discussionId = '/p/3ht42',
            fixture = {
                id: fixturesId,
                fixtures: [
                    '<form class="js-comment-box d-comment-box component"><div class="d-comment-box__errors"></div><label for="body" class="cta">Add your comment</label><textarea name="body" class="d-comment-box__body" placeholder="Join the discussion…"></textarea><button type="submit" class="submit-input comment-box__submit">Submit</button></form>'
                ]
            };

        // setup
        ajax.init({page: {
            ajaxUrl: '',
            edition: 'UK'
        }});

        // rerender the button each time
        beforeEach(function() {
            server = sinon.fakeServer.create();
            fixtures.render(fixture);
            context = document.getElementById(fixturesId);
            commentBox = new CommentBox(context);
            commentBox.attachTo();
        });

        afterEach(function() {
            server.restore();
            fixtures.clean(fixturesId);
        });

        describe('Post comment', function() {
            it('should error on empty comments', function() {
                expect(commentBox.getElem('error')).toBeUndefined();
                commentBox.getElem('body').value = '';
                bean.fire(commentBox.elem, 'submit');
                expect(commentBox.getElem('error')).not.toBeUndefined();
            });

            it('should error on comments over 5000 characters', function() {
                var textarea = commentBox.getElem('body');
                expect(commentBox.getElem('error')).toBeUndefined();
                for (var i = 0, len = 5000; i <= len; i++) {
                    textarea.value = textarea.value+'j';
                }
                bean.fire(commentBox.elem, 'submit');
                expect(commentBox.getElem('error')).not.toBeUndefined();
            });
            it('should send a success message to the user', function() {});
            it('post a comment to the API', function() {});

            describe('fail', function() {
                it('should send a failure message to the user', function() {});
                it('should allow the user to "try again"', function() {});
            });
        });



    });

});