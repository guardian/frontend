define([
    'common',
    'utils/ajax',
    'bean',
    'helpers/fixtures',
    'fixtures/discussion/discussion',
    'fixtures/discussion/comment-valid',
    'fixtures/discussion/api-post-comment-valid',
    'modules/discussion/comment-box'
], function(
    common,
    ajax,
    bean,
    fixtures,
    discussionJson,
    validCommentText,
    apiPostValidCommentResp,
    CommentBox
) {
    describe('Comment box', function() {
        var context, server,
            fixturesId = 'comment-box',
            discussionId = '/p/3ht42',
            maxCommentLength = 2500,
            fixture = {
                id: fixturesId,
                fixtures: [
                    '<form class="js-comment-box d-comment-box component" data-discussion-id="'+ discussionId +'"><div class="d-comment-box__messages"></div><label for="body" class="cta">Add your comment</label><textarea name="body" class="d-comment-box__body" placeholder="Join the discussion…"></textarea><button type="submit" class="submit-input d-comment-box__submit">Submit</button></form>'
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
            commentBox = new CommentBox(context, common.mediator, { apiRoot: '/discussion', maxLength: maxCommentLength });
            commentBox.attachTo();
        });

        afterEach(function() {
            server.restore();
            fixtures.clean(fixturesId);
        });

        describe('Post comment', function() {
            it('should only disable button when there is no comment body', function() {
                var button = commentBox.getElem('submitButton'),
                    commentBody = commentBox.getElem('body');

                commentBody.value = '';
                bean.fire(commentBody, 'change');
                expect(button.getAttribute('disabled')).toBe('disabled');

                commentBody.value = 'Hello';
                bean.fire(commentBody, 'change');
                expect(button.getAttribute('disabled')).toBeNull();

                commentBody.value = '';
                bean.fire(commentBody, 'change');
                expect(button.getAttribute('disabled')).toBe('disabled');
            });

            it('should error on empty comments', function() {
                expect(commentBox.getElem('error')).toBeUndefined();
                commentBox.getElem('body').value = '';
                bean.fire(commentBox.elem, 'submit');
                expect(commentBox.getElem('error')).not.toBeUndefined();
            });

            it('should error on comments over '+ maxCommentLength +' characters', function() {
                var commentBody = commentBox.getElem('body');
                expect(commentBox.getElem('error')).toBeUndefined();
                for (var i = 0, len = maxCommentLength; i <= len; i++) {
                    commentBody.value = commentBody.value+'j';
                }
                bean.fire(commentBox.elem, 'submit');
                expect(commentBox.getElem('error')).not.toBeUndefined();
            });

            it('should send a success message to the user when comment is valid', function() {
                var callback = jasmine.createSpy();
                runs(function() {
                    commentBox.on('post:success', callback);
                    server.respondWith([200, {}, apiPostValidCommentResp]);
                    commentBox.getElem('body').value = validCommentText;
                    bean.fire(commentBox.elem, 'submit');
                });

                waitsFor(function() {
                    server.respond();
                    return callback.calls.length > 0;
                }, 1000);

                // This id comes from api-post-comment-valid
                runs(function() {
                    expect(JSON.stringify(callback.calls[0].args[0].id)).toEqual(JSON.parse(apiPostValidCommentResp).message);
                });
            });

            xdescribe('fail', function() {
                xit('should send a failure message to the user');
                xit('should allow the user to "try again"');
            });
        });



    });

});
