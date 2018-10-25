// @flow
import { handle, closeTooltip } from 'common/modules/discussion/upvote';
import { recommendComment as recommendComment_ } from 'common/modules/discussion/api';
import fakeConfig from 'lib/config';

jest.mock('lib/raven');
jest.mock('common/modules/discussion/api', () => ({
    recommendComment: jest.fn(),
}));

jest.mock('lib/config', () => ({
    switches: {
        discussionAllowAnonymousRecommendsSwitch: false,
    },
}));

const recommendComment: any = recommendComment_;

const fakeUser = {
    userId: 'fakeUserId',
    displayName: 'fakeDisplayName',
    webUrl: 'fakeWebUrl',
    apiUrl: 'fakeApiUrl',
    avatar: 'fakeAvatar',
    secureAvatarUrl: 'fakeSecureAvatarUrl',
    badge: [],
    details: {
        about: 'aboutAbout',
        age: 'fakeAge',
        gender: 'fakeGender',
        interests: 'interestsFake',
        location: 'locationFake',
        realName: 'realNameFake',
        webPage: 'webPageFake',
    },
    privateFields: {
        canPostComment: true,
        hasCommented: true,
        isPremoderated: true,
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

        recommendComment.mockReset();
    });

    it('should send a request to discussion API if the user is logged in', () => {
        const target = document.querySelector('.js-recommend-comment');

        if (!target) {
            return Promise.reject(new Error('Error querying DOM'));
        }

        recommendComment.mockImplementationOnce(() => Promise.resolve());
        fakeConfig.switches.discussionAllowAnonymousRecommendsSwitch = false;

        return handle(
            target,
            document.querySelector('.recommendation-test'),
            fakeUser
        ).then(() => {
            expect(recommendComment).toHaveBeenCalled();
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
            return Promise.reject(new Error('Error querying DOM'));
        }

        recommendComment.mockImplementationOnce(() => Promise.resolve());
        fakeConfig.switches.discussionAllowAnonymousRecommendsSwitch = true;

        return handle(
            target,
            document.querySelector('.recommendation-test'),
            null
        ).then(() => {
            expect(recommendComment).toHaveBeenCalled();
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
            return Promise.reject(new Error('Error querying DOM'));
        }

        recommendComment.mockImplementationOnce(() =>
            Promise.reject(new Error('discussion api error'))
        );
        fakeConfig.switches.discussionAllowAnonymousRecommendsSwitch = false;

        return handle(
            target,
            document.querySelector('.recommendation-test'),
            fakeUser
        ).catch(() => {
            expect(recommendComment).toHaveBeenCalled();
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
            return Promise.reject(new Error('Error querying DOM'));
        }

        recommendComment.mockImplementationOnce(() =>
            Promise.reject(new Error('discussion api error'))
        );
        fakeConfig.switches.discussionAllowAnonymousRecommendsSwitch = false;

        return handle(
            target,
            document.querySelector('.recommendation-test'),
            null
        )
            .then(() => {
                expect(recommendComment).not.toHaveBeenCalled();
                expect(
                    target.classList.contains(
                        'd-comment__recommend--recommended'
                    )
                ).toBe(false);
                expect(tooltip.hasAttribute('hidden')).toBe(false);
                expect(link.getAttribute('href')).toBe(
                    'http://theguardian.com/test/signin?keep=this&returnUrl=http%3A%2F%2Ftheguardian.com%2Fcomment-1'
                );

                return closeTooltip();
            })
            .then(() => {
                expect(tooltip.hasAttribute('hidden')).toBe(true);
            });
    });
});
