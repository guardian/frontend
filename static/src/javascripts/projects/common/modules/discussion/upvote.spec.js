// @flow
import $ from 'lib/$';
import { handle, closeTooltip } from 'common/modules/discussion/upvote';
import fakeDiscussionApi from 'common/modules/discussion/api';
import config from 'lib/config';

jest.mock('common/modules/discussion/api', () => ({
    recommendComment: jest.fn(),
}));

jest.mock('lib/config', () => ({
    switches: {
        discussionAllowAnonymousRecommendsSwitch: false,
    },
}));

describe('Recommendations of comments', () => {
    beforeEach(() => {
        // The contract to keep in mind is that comments loader calls
        // `handle` when clicking on a recommendation
        // `closeTooltip` when clicking on the tooltip close
        $('body').append(
            [
                '<div class="recommendation-test">',
                // Upvote icon
                '<div class="js-recommend-comment" data-comment-id="1" data-comment-url="http://theguardian.com/comment-1">',
                'icon',
                '</div>',
                // Tooltip
                '<div class="js-rec-tooltip" hidden>',
                '<a class="js-rec-tooltip-link" href="http://theguardian.com/test/signin?keep=this">Sign in</a>',
                '</div>',
                // Comment list, used to understand if we're open for recommendations
                '<div class="d-discussion--recommendations-open"></div>',
                '</div>',
            ].join('')
        );

        fakeDiscussionApi.recommendComment.mockReset();
    });

    afterEach(() => {
        $('.recommendation-test').remove();
    });

    it('should send a request to discussion API if the user is logged in', done => {
        const target = document.querySelector('.js-recommend-comment');

        fakeDiscussionApi.recommendComment.mockImplementationOnce(() =>
            Promise.resolve()
        );
        config.switches.discussionAllowAnonymousRecommendsSwitch = false;

        handle(target, document.querySelector('.recommendation-test'), 'fabio')
            .then(() => {
                expect(fakeDiscussionApi.recommendComment).toHaveBeenCalled();
                expect(
                    target.classList.contains(
                        'd-comment__recommend--recommended'
                    )
                ).toBe(true, 'clicked classList');
                expect(target.classList.contains('js-recommend-comment')).toBe(
                    false,
                    'action classList'
                );
            })
            .then(done)
            .catch(done.fail);
    });

    it('should send an anonymous request to the discussion API when permitted', done => {
        const target = document.querySelector('.js-recommend-comment');

        fakeDiscussionApi.recommendComment.mockImplementationOnce(() =>
            Promise.resolve()
        );
        config.switches.discussionAllowAnonymousRecommendsSwitch = true;

        handle(target, document.querySelector('.recommendation-test'), null)
            .then(() => {
                expect(fakeDiscussionApi.recommendComment).toHaveBeenCalled();
                expect(
                    target.classList.contains(
                        'd-comment__recommend--recommended'
                    )
                ).toBe(true, 'clicked classList');
                expect(target.classList.contains('js-recommend-comment')).toBe(
                    false,
                    'action classList'
                );
            })
            .then(done)
            .catch(done.fail);
    });

    it('should allow retry if the discussion api returns an error', done => {
        const target = document.querySelector('.js-recommend-comment');

        fakeDiscussionApi.recommendComment.mockImplementationOnce(() =>
            Promise.reject(new Error('discussion api error'))
        );
        config.switches.discussionAllowAnonymousRecommendsSwitch = false;

        handle(target, document.querySelector('.recommendation-test'), 'fabio')
            .then(done.fail)
            .catch(() => {
                expect(fakeDiscussionApi.recommendComment).toHaveBeenCalled();
                expect(
                    target.classList.contains(
                        'd-comment__recommend--recommended'
                    )
                ).toBe(false, 'clicked classList');
                expect(target.classList.contains('js-recommend-comment')).toBe(
                    true,
                    'action classList'
                );
            })
            .then(done)
            .catch(done.fail);
    });

    it('should show a tooltip with a return link to the upvoted comment', done => {
        const target = document.querySelector('.js-recommend-comment');
        const tooltip = document.querySelector('.js-rec-tooltip');
        const link = document.querySelector('.js-rec-tooltip-link');

        fakeDiscussionApi.recommendComment.mockImplementationOnce(() =>
            Promise.reject(new Error('discussion api error'))
        );
        config.switches.discussionAllowAnonymousRecommendsSwitch = false;

        handle(target, document.querySelector('.recommendation-test'), null)
            .then(() => {
                expect(
                    fakeDiscussionApi.recommendComment
                ).not.toHaveBeenCalled();
                expect(
                    target.classList.contains(
                        'd-comment__recommend--recommended'
                    )
                ).toBe(false, 'clicked classList');
                expect(tooltip.hasAttribute('hidden')).toBe(
                    false,
                    'hidden attribute'
                );
                expect(link.getAttribute('href')).toBe(
                    'http://theguardian.com/test/signin?keep=this&returnUrl=http://theguardian.com/comment-1'
                );

                return closeTooltip();
            })
            .then(() => {
                expect(tooltip.hasAttribute('hidden')).toBe(
                    true,
                    'hidden attribute'
                );
            })
            .then(done)
            .catch(done.fail);
    });
});
