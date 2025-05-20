import { CommentBox } from 'common/modules/discussion/comment-box';
import { getUserData as getUserFromApi_ } from 'common/modules/identity/api';
import { postComment as postComment_ } from 'common/modules/discussion/api';

jest.mock('lib/config', () => ({
    get: jest.fn(() => 'https://manage.thegulocal.com'),
}));
jest.mock('lib/mediator');
jest.mock('common/modules/discussion/user-avatars', () => ({
    avatarify() { },
}));
jest.mock('common/modules/identity/api', () => ({
    getUserFromCookie: jest.fn().mockReturnValue({
        publicFields: {
            displayName: 'testy',
        },
        id: 1,
        dates: {
            accountCreatedDate: new Date(1392719401338),
        },
        statusFields: {
            userEmailValidated: false
        }
    }),
    getUserData: jest.fn().mockResolvedValue({
            statusFields: {
                userEmailValidated: true,
        },
    }),
    reset: jest.fn(),
}));
jest.mock('common/modules/discussion/api', () => ({
    postComment: jest.fn(),
    getUser: jest.fn(),
}));

const getUserFromApi = (getUserFromApi_);
const postComment = (postComment_);

describe('Comment box', () => {
    const discussionId = '/p/3ht42';
    const maxCommentLength = 2500;
    const validCommentText =
        "'I don't know what you mean,' said Alice.\n\n" +
        "'Of course you don't!' the Hatter said, tossing his head contemptuously. 'I dare say you never even spoke to Time!'\n\n" +
        "'Perhaps not,' Alice cautiously replied: 'but I know I have to beat time when I learn music.'";
    const apiPostValidCommentResp =
        '{"status": "ok", "message": "27388163", "statusCode": 200}';
    const apiPostValidCommentButDiscussionClosed =
        '{"status":"error", "statusCode": 409, "message":"Discussion closed", "errorCode": "DISCUSSION_CLOSED"}';
    const apiPostValidCommentButReadOnlyMode =
        '{"status":"error", "statusCode": 503, "message":"Commenting is undergoing maintenance but will be back again shortly.", "errorCode": "READ-ONLY-MODE"}';
    const apiPostValidCommentButIdentityUsernameMissing =
        '{"status":"error","statusCode":400,"message":"Username is missing","errorCode":"USERNAME_MISSING"}';
    let commentBox;
    let commentBoxEl;

    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
                <form class="component js-comment-box d-comment-box">
                <label for="body" class="d-comment-box__add-comment cta">Add your comment</label>
                <div class="d-comment-box__meta">
                <span class="d-comment-box__avatar-wrapper">
                </span>
                <div class="d-comment-box__meta-text">
                <span class="d-comment-box__author"></span>
                <span class="i i-reply-grey"></span>
                <span class="d-comment-box__reply-to-author"></span>
                <span class="u-fauxlink d-comment-box__show-parent" role="button">Show comment</span>
                <span class="u-fauxlink d-comment-box__hide-parent" role="button">Hide comment</span>
                </div>
                </div>
                <div class="d-comment-box__parent-comment-wrapper">
                <div class="d-comment-box__parent-comment-spout"></div>
                <div class="d-comment-box__parent-comment">
                <span class="d-comment-box__parent-comment-author"></span>
                <div class="d-comment-box__parent-comment-body"></div>
                <span class="u-fauxlink d-comment-box__hide-parent" role="button">Hide comment</span>
                </div>
                </div>
                <div class="d-comment-box__content">
                <div class="d-comment-box__messages"></div>
                <div class="d-comment-box__error d-comment-box__premod">Your comments are currently being pre-moderated (<a href="/community-faqs#311" target="_blank">why?</a>)</div>
                <textarea name="body" class="textarea d-comment-box__body" placeholder="Join the discussion…"></textarea>
                <button type="submit" class="submit-input d-comment-box__submit">Post comment</button>
                </div>
                <div class="d-comment-box__preview-wrapper">
                <div class="d-comment-box__preview-body"></div>
                <button type="submit" class="submit-input d-comment-box__submit d-comment-box__preview-submit">Post your comment</button>
                </div>
                </form>
            `;
        }

        commentBox = new CommentBox({
            discussionId,
            maxLength: maxCommentLength,
            switches: {},
        });

        commentBoxEl = document.querySelector('.d-comment-box');

        if (commentBoxEl) {
            commentBox.attachTo(commentBoxEl);
        }
    });

    describe('Post comment', () => {
        it('should only disable button when there is no comment body', () => {
            const button = commentBox.getElem('submit');
            const commentBody = commentBox.getElem('body');

            if (
                commentBody &&
                commentBody instanceof HTMLTextAreaElement &&
                button
            ) {
                commentBody.value = '';
                commentBox.setFormState();
                expect(button.getAttribute('disabled')).toBe('disabled');

                commentBody.value = 'Hello';
                commentBox.setFormState();
                expect(button.getAttribute('disabled')).toBeNull();

                commentBody.value = '';
                commentBox.setFormState();
                expect(button.getAttribute('disabled')).toBe('disabled');
            }
        });

        it('should error on empty comments', () => {
            const commentBody = commentBox.getElem('body');

            expect(commentBox.getElem('error')).toBeUndefined();

            if (commentBody && commentBody instanceof HTMLTextAreaElement) {
                commentBody.value = '';

                return commentBox.postComment().then(() => {
                    expect(commentBox.getElem('error')).not.toBeUndefined();
                });
            }
        });

        it(`should error on comments over ${maxCommentLength} characters`, () => {
            const commentBody = commentBox.getElem('body');

            expect(commentBox.getElem('error')).toBeUndefined();

            if (commentBody && commentBody instanceof HTMLTextAreaElement) {
                for (let i = 0, len = maxCommentLength; i <= len; i += 1) {
                    commentBody.value = `${commentBody.value}j`;
                }
                return commentBox.postComment().then(() => {
                    expect(commentBox.getElem('error')).not.toBeUndefined();
                });
            }
        });

        it('should error on invalid email address', () => {
            const commentBody = commentBox.getElem('body');

            expect(commentBox.getElem('error')).toBeUndefined();

            if (commentBody && commentBody instanceof HTMLTextAreaElement) {
                commentBody.value = validCommentText;

                getUserFromApi.mockResolvedValueOnce(
                    {
                            statusFields: {
                                userEmailValidated: false,
                        },
                    },
                );

                return commentBox.postComment().then(() => {
                    expect(commentBox.getElem('error')).not.toBeUndefined();
                });
            }
        });

        it('should error on discussion closed', () => {
            const commentBody = commentBox.getElem('body');

            expect(commentBox.getElem('error')).toBeUndefined();

            if (commentBody && commentBody instanceof HTMLTextAreaElement) {
                commentBody.value = validCommentText;

                postComment.mockReturnValueOnce(
                    Promise.resolve(JSON.parse(apiPostValidCommentButDiscussionClosed))
                );

                return commentBox.postComment().then(() => {
                    expect(commentBox.getElem('error')).not.toBeUndefined();
                });
            }
        });

        it('should error on read only mode', () => {
            const commentBody = commentBox.getElem('body');

            expect(commentBox.getElem('error')).toBeUndefined();

            if (commentBody && commentBody instanceof HTMLTextAreaElement) {
                commentBody.value = validCommentText;

                postComment.mockReturnValueOnce(
                    Promise.resolve(JSON.parse(apiPostValidCommentButReadOnlyMode))
                );

                return commentBox.postComment().then(() => {
                    expect(commentBox.getElem('error')).not.toBeUndefined();
                });
            }
        });

        it('should send a success message to the user when comment is valid', () => {
            const commentBody = commentBox.getElem('body');

            if (commentBody && commentBody instanceof HTMLTextAreaElement) {
                commentBody.value = validCommentText;

                postComment.mockReturnValueOnce(
                    Promise.resolve(JSON.parse(apiPostValidCommentResp))
                );

                return commentBox.postComment().then(comment => {
                    expect(JSON.stringify(comment.id)).toEqual(
                        JSON.parse(apiPostValidCommentResp).message
                    );
                });
            }
        });

        it('should error on identity username missing', () => {
            const commentBody = commentBox.getElem('body');

            expect(commentBox.getElem('error')).toBeUndefined();

            if (commentBody && commentBody instanceof HTMLTextAreaElement) {
                commentBody.value = validCommentText;

                postComment.mockReturnValueOnce(
                    Promise.resolve(JSON.parse(apiPostValidCommentButIdentityUsernameMissing))
                );

                return commentBox.postComment().then(() => {
                    expect(commentBox.getElem('error')).not.toBeUndefined();
                });
            }
        });
    });
});
