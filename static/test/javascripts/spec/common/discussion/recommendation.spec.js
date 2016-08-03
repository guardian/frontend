define([
    'common/utils/$',
    'helpers/injector'
],
function (
    $,
    Injector
) {
    describe('Recommendations of comments', function () {
        var discussionApi = {
            recommendComment: function () {}
        },
        injector = new Injector(), config, upvote;

        beforeEach( function (done) {

            injector.require(['common/modules/discussion/upvote', 'common/utils/config'], function() {
                upvote = arguments[0];
                config = arguments[1];

                config.switches = {};
                config.switches.discussionAllowAnonymousRecommendsSwitch = false;
                done();
            });

            // The contract to keep in mind is that comments loader calls
            // `upvote.handle` when clicking on a recommendation
            // `upvote.closeTooltip` when clicking on the tooltip close
            $('body').append([
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
                '</div>'
            ].join(''));
        });

        afterEach(function () {
            $('.recommendation-test').remove();
        });

        it('should send a request to discussion API if the user is logged in', function (done) {
            config.switches.discussionAllowAnonymousRecommendsSwitch = false;
            spyOn(discussionApi, 'recommendComment').and.callFake(function () {
                return Promise.resolve();
            });
            var target = document.querySelector('.js-recommend-comment');

            upvote.handle(
                target,
                document.querySelector('.recommendation-test'),
                'fabio',
                discussionApi
            )
            .then(function () {
                expect(discussionApi.recommendComment).toHaveBeenCalled();
                expect(target.classList.contains('d-comment__recommend--recommended')).toBe(true, 'clicked classList');
                expect(target.classList.contains('js-recommend-comment')).toBe(false, 'action classList');
            })
            .then(done)
            .catch(done.fail);
        });

        it ('should send an anonymous swithch to the discussion API if the the allow anonoymous recommends is switched on', function(done) {

            config.switches.discussionAllowAnonymousRecommendsSwitch = true;
            spyOn(discussionApi, 'recommendComment').and.callFake(function () {
                return Promise.resolve();
            });
            var target = document.querySelector('.js-recommend-comment');

            upvote.handle(
                target,
                document.querySelector('.recommendation-test'),
                null,
                discussionApi
            )
            .then(function() {
                expect(discussionApi.recommendComment).toHaveBeenCalled();
                expect(target.classList.contains('d-comment__recommend--recommended')).toBe(true, 'clicked classList');
                expect(target.classList.contains('js-recommend-comment')).toBe(false, 'action classList');
            })
            .then(done)
            .catch(done.fail);
        });

        it('should allow retry if the discussion api returns an error', function (done) {
            config.switches.discussionAllowAnonymousRecommendsSwitch = false;
            spyOn(discussionApi, 'recommendComment').and.callFake(function () {
                return Promise.reject(new Error('discussion api error'));
            });
            var target = document.querySelector('.js-recommend-comment');

            upvote.handle(
                target,
                document.querySelector('.recommendation-test'),
                'fabio',
                discussionApi
            )
            .then(done.fail)
            .catch(function () {
                expect(discussionApi.recommendComment).toHaveBeenCalled();
                expect(target.classList.contains('d-comment__recommend--recommended')).toBe(false, 'clicked classList');
                expect(target.classList.contains('js-recommend-comment')).toBe(true, 'action classList');
            })
            .then(done)
            .catch(done.fail);
        });

        it('should show a tooltip with a return link to the upvoted comment', function (done) {
            config.switches.discussionAllowAnonymousRecommendsSwitch = false;
            spyOn(discussionApi, 'recommendComment').and.callFake(function () {
                return Promise.reject(new Error('discussion api error'));
            });
            var target = document.querySelector('.js-recommend-comment');
            var tooltip = document.querySelector('.js-rec-tooltip');
            var link = document.querySelector('.js-rec-tooltip-link');

            upvote.handle(
                target,
                document.querySelector('.recommendation-test'),
                null,
                discussionApi
            )
            .then(function () {
                expect(discussionApi.recommendComment).not.toHaveBeenCalled();
                expect(target.classList.contains('d-comment__recommend--recommended')).toBe(false, 'clicked classList');
                expect(tooltip.hasAttribute('hidden')).toBe(false, 'hidden attribute');
                expect(link.getAttribute('href')).toBe('http://theguardian.com/test/signin?keep=this&returnUrl=http://theguardian.com/comment-1');

                return upvote.closeTooltip();
            })
            .then(function () {
                expect(tooltip.hasAttribute('hidden')).toBe(true, 'hidden attribute');
            })
            .then(done)
            .catch(done.fail);
        });
    });
});
