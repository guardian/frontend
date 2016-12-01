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
        this.id = 'AuMembEngagementMsgCopyTest8';
        this.start = '2016-11-24';
        this.expiry = '2017-1-5';
        this.author = 'Justin Pinner';
        this.description = 'Test alternate short messages on AU engagement banner (test 8)';
        this.audience = 1;    // 100% (of AU audience)
        this.audienceOffset = 0;
        this.successMeasure = 'Membership conversions';
        this.audienceCriteria = '100 percent of (non-member) AU edition readers';
        this.dataLinkNames = '';
        this.idealOutcome = 'We will see a 50 percent uplift in conversions through the engagement banner';
        this.hypothesis = 'More persuasive copy will improve membership conversions from impressions';

        this.canRun = function () {
            return config.page.edition.toLowerCase() === 'au' &&
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
                id: 'fearless_10',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'stories_that_matter',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'power_to_account',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'independent_journalism',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});
