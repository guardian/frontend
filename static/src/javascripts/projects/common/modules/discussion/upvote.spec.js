// @flow
import { handle, closeTooltip } from 'common/modules/discussion/upvote';
import fakeDiscussionApi from 'common/modules/discussion/api';
import fakeConfig from 'lib/config';

jest.mock('common/modules/discussion/api', () => ({
    recommendComment: jest.fn(),
}));

jest.mock('lib/config', () => ({
    switches: {
        discussionAllowAnonymousRecommendsSwitch: false,
    },
}));

const fakeUser = {
    userId: 'fakeUserId',
    displayName: 'fakeDisplayName',
    webUrl: 'fakeWebUrl',
    apiUrl: 'fakeApiUrl',
    avatar: 'fakeAvatar',
    secureAvatarUrl: 'fakeSecureAvatarUrl',
    badge: [],
    details: {
        gender: 'fakeGender',
    },
};

describe('Recommendations of comments', () => {
    beforeEach(() => {
        // The contract to keep in mind is that comments loader calls
        // `handle` when clicking on a recommendation
        // `closeTooltip` when clicking on the tooltip close
        if (document.body) {
            document.body.innerHTML = `
            <div class="recommendation-test">
                <div class="js-recommend-comment" data-comment-id="1" data-comment-url="http://theguardian.com/comment-1">
                    icon
                </div>
                <div class="js-rec-tooltip" hidden>
                    <a class="js-rec-tooltip-link" href="http://theguardian.com/test/signin?keep=this">Sign in</a>
                </div>
                <div class="d-discussion--recommendations-open"></div>
            </div>`;
        }

        fakeDiscussionApi.recommendComment.mockReset();
    });

    it('should send a request to discussion API if the user is logged in', () => {
        const target = document.querySelector('.js-recommend-comment');

        if (!target) {
            return Promise.reject('Error querying DOM');
        }

        fakeDiscussionApi.recommendComment.mockImplementationOnce(() =>
            Promise.resolve()
        );
        fakeConfig.switches.discussionAllowAnonymousRecommendsSwitch = false;

        return handle(
            target,
            document.querySelector('.recommendation-test'),
            fakeUser
        ).then(() => {
            expect(fakeDiscussionApi.recommendComment).toHaveBeenCalled();
            expect(
                target.classList.contains('d-comment__recommend--recommended')
            ).toBe(true);
            expect(target.classList.contains('js-recommend-comment')).toBe(
                false
            );
        });
    });

    it('should send an anonymous request to the discussion API when permitted', () => {
        const target = document.querySelector('.js-recommend-comment');

        if (!target) {
            return Promise.reject('Error querying DOM');
        }

        fakeDiscussionApi.recommendComment.mockImplementationOnce(() =>
            Promise.resolve()
        );
        fakeConfig.switches.discussionAllowAnonymousRecommendsSwitch = true;

        return handle(
            target,
            document.querySelector('.recommendation-test'),
            null
        ).then(() => {
            expect(fakeDiscussionApi.recommendComment).toHaveBeenCalled();
            expect(
                target.classList.contains('d-comment__recommend--recommended')
            ).toBe(true);
            expect(target.classList.contains('js-recommend-comment')).toBe(
                false
            );
        });
    });

    it('should allow retry if the discussion api returns an error', () => {
        const target = document.querySelector('.js-recommend-comment');

        if (!target) {
            return Promise.reject('Error querying DOM');
        }

        fakeDiscussionApi.recommendComment.mockImplementationOnce(() =>
            Promise.reject(new Error('discussion api error'))
        );
        fakeConfig.switches.discussionAllowAnonymousRecommendsSwitch = false;

        return handle(
            target,
            document.querySelector('.recommendation-test'),
            fakeUser
        ).catch(() => {
            expect(fakeDiscussionApi.recommendComment).toHaveBeenCalled();
            expect(
                target.classList.contains('d-comment__recommend--recommended')
            ).toBe(false);
            expect(target.classList.contains('js-recommend-comment')).toBe(
                true
            );
        });
    });

    it('should show a tooltip with a return link to the upvoted comment', () => {
        const target = document.querySelector('.js-recommend-comment');
        const tooltip = document.querySelector('.js-rec-tooltip');
        const link = document.querySelector('.js-rec-tooltip-link');

        if (!target || !tooltip || !link) {
            return Promise.reject('Error querying DOM');
        }

        fakeDiscussionApi.recommendComment.mockImplementationOnce(() =>
            Promise.reject(new Error('discussion api error'))
        );
        fakeConfig.switches.discussionAllowAnonymousRecommendsSwitch = false;

        return handle(
            target,
            document.querySelector('.recommendation-test'),
            null
        )
            .then(() => {
                expect(
                    fakeDiscussionApi.recommendComment
                ).not.toHaveBeenCalled();
                expect(
                    target.classList.contains(
                        'd-comment__recommend--recommended'
                    )
                ).toBe(false);
                expect(tooltip.hasAttribute('hidden')).toBe(false);
                expect(link.getAttribute('href')).toBe(
                    'http://theguardian.com/test/signin?keep=this&returnUrl=http://theguardian.com/comment-1'
                );

                return closeTooltip();
            })
            .then(() => {
                expect(tooltip.hasAttribute('hidden')).toBe(true);
            });
    });
});
