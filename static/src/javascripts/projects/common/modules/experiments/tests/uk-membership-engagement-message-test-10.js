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
        this.id = 'UkMembEngagementMsgCopyTest10';
        this.start = '2016-11-23';
        this.expiry = '2016-12-8';
        this.author = 'Justin Pinner';
        this.description = 'Test alternate short messages on engagement banner (test 10)';
        this.audience = 1;    // 100% (of UK audience)
        this.audienceOffset = 0;
        this.successMeasure = 'Membership conversions';
        this.audienceCriteria = '100 percent of (non-member) UK edition readers';
        this.dataLinkNames = '';
        this.idealOutcome = 'We will see a 50 percent uplift in conversions through the engagement banner';
        this.hypothesis = 'More persuasive copy will improve membership conversions from impressions';

        this.canRun = function () {
            return config.page.edition.toLowerCase() === 'uk' &&
                commercialFeatures.canReasonablyAskForMoney;
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
                id: 'post_truth_world',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'now_is_the_time',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'everyone_chipped_in',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'free_and_open',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});
