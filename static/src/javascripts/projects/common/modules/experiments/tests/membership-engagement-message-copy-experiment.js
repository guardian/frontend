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
        this.start = '2016-10-25';
        this.expiry = '2016-11-3';
        this.author = 'Justin Pinner';
        this.description = 'Test alternate short messages on engagement banner';
        this.audience = 0.01; // TODO: set real percentage
        this.audienceOffset = 0.3;  // allow offset to engage different readers from MembershipEngagementWarpFactorOne test
        this.successMeasure = 'Readers engage with messaging banner more frequently';
        this.audienceCriteria = 'n percent of (non-member) UK edition readers'; // TODO: n percent?!
        this.dataLinkNames = '';
        this.idealOutcome = 'Better messaging promotes reader engagement with the membership engagement';
        this.hypothesis = 'Better messaging will connect with readers and they will engage more as a result';

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
                id: 'text_a',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'text_b',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'text_c',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});
