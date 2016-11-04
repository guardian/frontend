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
        this.id = 'MembershipEngagementMessageCopyExperiment';
        this.start = '2016-10-26';
        this.expiry = '2016-11-8';
        this.author = 'Justin Pinner';
        this.description = 'Test alternate short messages on engagement banner';
        this.audience = 0.6;    // 60% (of UK audience)
        this.audienceOffset = 0.3;  // allow offset to engage different readers from MembershipEngagementWarpFactorOne test
        this.successMeasure = 'More membership sign-ups';
        this.audienceCriteria = '60 percent of (non-member) UK edition readers';
        this.dataLinkNames = '';
        this.idealOutcome = 'More readers engage with the banner and then complete membership sign-up';
        this.hypothesis = 'More persuasive copy will improve membership conversions from impressions';

        this.canRun = function () {
            return config.page.edition.toLowerCase() === 'uk' &&
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
                id: 'fairer',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'appreciate',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'secure',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});
