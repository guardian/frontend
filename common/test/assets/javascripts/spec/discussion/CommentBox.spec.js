define([
    'common',
    'ajax',
    'helpers/fixtures',
    'modules/discussion/comment-box'
], function(
    common,
    ajax,
    fixtures,
    CommentBox
) {
    describe('Comment box', function() {
        var context, button, server, loader,
            fixturesId = 'comment-box',
            discussionId = '/p/3ht42',
            fixture = {
                id: fixturesId,
                fixtures: [
                    '<form class="js-comment-box d-comment-box component"><label for="body" class="cta">Add your comment</label><textarea name="body" class="d-comment-box__body" placeholder="Join the discussion…"></textarea><button type="submit" class="submit-input comment-box__submit">Submit</button></form>'
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
            // fixtures.clean(fixturesId);
        });

        describe('Post comment', function() {
            it('post a comment to the API', function() {
                // commentBox.elem.submit();
            });
            it('should error on comments over 5000 characters', function() {});
            it('should error on empty comments', function() {});
            it('should send a success message to the user', function() {});

            describe('fail', function() {
                it('should send a failure message to the user', function() {});
                it('should allow the user to "try again"', function() {});
            });
        });



    });

});