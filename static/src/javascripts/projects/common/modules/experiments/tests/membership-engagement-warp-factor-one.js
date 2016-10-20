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
        this.id = 'MembershipEngagementWarpFactorOne';
        this.start = '2016-10-20';
        this.expiry = '2016-11-3';
        this.author = 'Justin Pinner';
        this.description = 'The first level of prominent engagement messaging';
        this.audience = 0.3;
        this.audienceOffset = 0;
        this.successMeasure = 'More readers become members';
        this.audienceCriteria = '30 percent of (non-member) UK edition readers';
        this.dataLinkNames = '';
        this.idealOutcome = 'Messaging promotes additional membership sign-up';
        this.hypothesis = 'Showing larger, bolder messages will encourage more readers to take up membership';

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
                id: 'become',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'join',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});
