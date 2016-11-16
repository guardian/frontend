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
        this.id = 'MembershipEngagementMessageCopyExperimentRestart';
        this.start = '2016-11-16';
        this.expiry = '2016-12-1';
        this.author = 'Justin Pinner';
        this.description = 'Test alternate short messages on engagement banner';
        this.audience = 1;    // 100% (of UK audience)
        this.audienceOffset = 0;
        this.successMeasure = 'More membership sign-ups';
        this.audienceCriteria = '100 percent of (non-member) UK edition readers';
        this.dataLinkNames = '';
        this.idealOutcome = 'More readers engage with the banner and then complete membership sign-up';
        this.hypothesis = 'More persuasive copy will improve membership conversions from impressions';

        this.canRun = function () {
            return config.page.edition.toLowerCase() === 'uk' &&
                commercialFeatures.canReasonablyAskForMoney &&
                config.page.contentType.toLowerCase() !== 'signup';
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
                id: 'control_2',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'Get_round_to_2',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'Give_upfront_2',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'Together_informed_2',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'Coffee_5_2',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});
