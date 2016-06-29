define([
    'common/utils/detect',
    'lodash/collections/contains'
], function (
    detect,
    contains
) {
    return function () {
        this.id = 'HostedAutoplay';
        this.start = '2016-30-06';
        this.expiry = '2016-14-07';
        this.author = 'Zofia Korcz';
        this.description = 'An autoplay overlay with the next video on a hosted page.';
        this.audience = 0.75;
        this.audienceOffset = 0.2;
        this.successMeasure = 'People will either more often click on the next hosted video or wait until end of the current video to be redirected into the next video page url.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'Next video autoplay: Cancel autoplay of the next video, Discover Zoe from Renault, Next Hosted Video Autoplay, Immediately play the next video, Next Hosted Video';
        this.idealOutcome = 'People will either more often click on the next hosted video or wait until end of the current video to be redirected into the next video page url.';

        this.canRun = function () {
            //return contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint());
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'variant1',
                test: function () {

                }
            },
            {
                id: 'variant2',
                test: function () {

                }
            }
        ];
    };
});
