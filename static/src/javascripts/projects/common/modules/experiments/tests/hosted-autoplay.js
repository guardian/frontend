define([
    'bean',
    'qwery',
    'common/utils/config',
    'common/utils/mediator'
], function (
    bean,
    qwery,
    config,
    mediator
) {
    return function () {
        this.id = 'HostedAutoplay';
        this.start = '2016-07-15';
        this.expiry = '2016-08-19';
        this.author = 'Zofia Korcz';
        this.description = 'An autoplay overlay with the next video on a hosted page.';
        this.audience = 0.75;
        this.audienceOffset = 0.25;
        this.successMeasure = 'People will either more often click on the next hosted video or wait until end of the current video to be redirected into the next video page url.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'Next video autoplay: Cancel autoplay of the next video, Discover Zoe from Renault, Next Hosted Video Autoplay, Immediately play the next video, Next Hosted Video';
        this.idealOutcome = 'People will either more often click on the next hosted video or wait until end of the current video to be redirected into the next video page url.';

        var testCampaigns = ['leffe-rediscover-time', 'renault-car-of-the-future'];

        this.canRun = function () {
            return config.page.contentType === 'Video' && config.page.tones === 'Hosted' && testCampaigns.indexOf(config.page.section) > -1;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function (complete) {
                    var nextVideo = qwery('.hosted__next-video--tile');
                    if (nextVideo.length) {
                        bean.on(nextVideo[0], 'click', complete);
                        bean.on(qwery('.hosted__container--full')[0], 'click', complete);
                    }
                }
            },
            {
                id: 'variant1',
                test: function () {},
                success: function (complete) {
                    var nextVideo = qwery('.hosted__next-video--tile');
                    if (nextVideo.length) {
                        bean.on(nextVideo[0], 'click', complete);
                        bean.on(qwery('.hosted__container--full')[0], 'click', complete);
                        bean.on(qwery('.hosted-next-autoplay__poster')[0], 'click', complete);
                        mediator.on('hosted video: autoredirect', complete);
                    }
                }
            },
            {
                id: 'variant2',
                test: function () {},
                success: function (complete) {
                    var nextVideo = qwery('.hosted__next-video--tile');
                    if (nextVideo.length) {
                        bean.on(nextVideo[0], 'click', complete);
                        bean.on(qwery('.hosted__container--full')[0], 'click', complete);
                        bean.on(qwery('.hosted-next-autoplay__poster')[0], 'click', complete);
                        bean.on(qwery('.hosted-next-autoplay__tile')[0], 'click', complete);
                        mediator.on('hosted video: autoredirect', complete);
                    }
                }
            }
        ];
    };
});
