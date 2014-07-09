define([
    'common/modules/identity/api',
    'common/utils/ajax',
    'common/utils/context',
    'bean',
    'helpers/fixtures',
    'fixtures/discussion/discussion',
    'fixtures/discussion/comment-valid',
    'fixtures/discussion/api-post-comment-valid',
    'common/modules/discussion/comment-box'
], function(
    Id,
    ajax,
    context,
    bean,
    fixtures,
    discussionJson,
    validCommentText,
    apiPostValidCommentResp,
    CommentBox
) {
    describe('Comment box', function() {
        var server,
            fixturesId = 'comment-box',
            discussionId = '/p/3ht42',
            maxCommentLength = 2500,
            fixture = {
                id: fixturesId,
                fixtures: [
                    '<form class="component js-comment-box d-comment-box">'+
                        '<label for="body" class="d-comment-box__add-comment cta">Add your comment</label>'+

                        '<div class="d-comment-box__meta">' +
                            '<span class="d-comment-box__avatar-wrapper">' +
                            '</span>' +
                            '<div class="d-comment-box__meta-text">' +
                                '<span class="d-comment-box__author"></span>' +
                                '<span class="i i-in-reply-arrow"></span>' +
                                '<span class="d-comment-box__reply-to-author"></span>' +
                                '<span class="u-fauxlink d-comment-box__show-parent" role="button">Show comment</span>' +
                                '<span class="u-fauxlink d-comment-box__hide-parent" role="button">Hide comment</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="d-comment-box__parent-comment-wrapper">' +
                            '<div class="d-comment-box__parent-comment-spout"></div>' +
                            '<div class="d-comment-box__parent-comment">' +
                                '<span class="d-comment-box__parent-comment-author"></span>' +
                                '<div class="d-comment-box__parent-comment-body"></div>' +
                                '<span class="u-fauxlink d-comment-box__hide-parent" role="button">Hide comment</span>' +
                            '</div>' +
                        '</div>' +
                        '<input type="hidden" name="sentiment" />' +
                        '<div class="d-comment-box__content">'+
                            '<div class="d-comment-box__messages"></div>'+
                            '<div class="d-comment-box__error d-comment-box__premod">Your comments are currently being pre-moderated (<a href="/community-faqs#311" target="_blank">why?</a>)</div>'+
                            '<textarea name="body" class="textarea d-comment-box__body" placeholder="Join the discussion…"></textarea>'+
                            '<button type="submit" class="submit-input d-comment-box__submit">Post comment</button>'+
                        '</div>'+
                        '<div class="d-comment-box__preview-wrapper">'+
                            '<div class="d-comment-box__preview-body"></div>'+
                            '<button type="submit" class="submit-input d-comment-box__submit d-comment-box__preview-submit">Post your comment</button>'+
                        '</div>'+
                    '</form>'
                ]
            },
            idConfig = {
                'page' : {
                    'idApiUrl' : "https://idapi.theguardian.com",
                    'idUrl' : "https://profile.theguardian.com",
                    ajaxUrl: '',
                    edition: 'UK'
                }
            },
            reqwestReturn = {
                'then': function() {}
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
            context.set(document.getElementById(fixturesId));
            commentBox = new CommentBox({
                discussionId: discussionId,
                maxLength: maxCommentLength,
                switches: {}
            });

            spyOn(commentBox, 'getUserData').andReturn({
                displayName: "testy",
                id: 1,
                accountCreatedDate: new Date(1392719401338)
            });

            commentBox.attachTo(document.querySelector('.d-comment-box'));

            Id.init(idConfig);
            Id.reset();

            // Stub out this method as async merging stuff doesn't work great
            Id.getUserFromApiWithRefreshedCookie = function () {
                this.then = function (callback) {
                    callback({
                        user: { statusFields: { userEmailValidated: true } } });
                };
                return this;
            };
        });

        afterEach(function() {
            server.restore();
            fixtures.clean(fixturesId);
        });

        describe('Post comment', function() {
            it('should only disable button when there is no comment body', function() {
                var button = commentBox.getElem('submit'),
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

            it('should error on invalid email address', function() {
                expect(commentBox.getElem('error')).toBeUndefined();
                commentBox.getElem('body').value = validCommentText;

                Id.getUserFromApiWithRefreshedCookie = function () {
                    this.then = function (callback) {
                        callback({
                            user: { statusFields: { userEmailValidated: false } } });
                    };
                    return this;
                };

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
