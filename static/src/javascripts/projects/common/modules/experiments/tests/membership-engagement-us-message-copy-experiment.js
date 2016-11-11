define([
    'bean',
    'reqwest',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/modules/commercial/commercial-features',
    'common/utils/mediator'
], function (
    bean,
    reqwest,
    fastdom,
    qwery,
    $,
    config,
    commercialFeatures,
    mediator
) {
    return function () {
        this.id = 'MembershipEngagementUsMessageCopyExperiment';
        this.start = '2016-10-27';
        this.expiry = '2016-11-15';
        this.author = 'Justin Pinner';
        this.description = 'Test alternate short messages on engagement banner';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'More US membership sign-ups';
        this.audienceCriteria = '100 percent of (non-member) US edition readers';
        this.dataLinkNames = '';
        this.idealOutcome = 'More US readers engage with the banner and then complete membership sign-up';
        this.hypothesis = 'More persuasive copy will improve US membership conversions from impressions';

        this.canRun = function () {
            return config.page.edition.toLowerCase() === 'us' &&
                commercialFeatures.canReasonablyAskForMoney &&
                config.page.contentType !== 'signup';
        };

        var success = function (complete) {
            if (this.canRun()) {
                mediator.on('membership-message:display', function () {
                    bean.on(qwery('#membership__engagement-message-link')[0], 'click', complete);
                });
            }
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'informed',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});
