define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/storage'
], function (
    bean,
    fastdom,
    $,
    cookies,
    detect,
    storage
) {
    return function () {
        this.id = 'SignedOut';
        this.start = '2015-03-10';
        // far future expiration, only really using the test to bucket users, which we can use for targeting in dfp
        this.expiry = '2015-03-31';
        this.author = 'Sam Morris';
        this.description = 'Testing to see if alerting users on sign out will increase the sign in rate.';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Users sign back in after signing out.';
        this.audienceCriteria = 'All users who have signed out and are not signed in and are not on mobile and have not closed the message before';
        this.dataLinkNames = 'Signed Out Link';
        this.idealOutcome = 'Sign in rate increases';

        this.canRun = function () {
            if (cookies.get('GU_SO') && !(cookies.get('GU_U')) && (detect.getBreakpoint() !== 'mobile') && !(storage.local.get('gu.ab.signedout'))) {
                return true;
            }
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'show-message',
                test: function () {
                    $('.js-popup-signed-out').removeClass('u-h');
                    bean.on($('.js-popup-toggle')[0], 'click', function () {
                        fastdom.write(function () {
                            $('.js-popup-signed-out').addClass('u-h');
                        });
                        storage.local.set('gu.ab.signedout', true);
                    });
                }
            }
        ];
    };

});
