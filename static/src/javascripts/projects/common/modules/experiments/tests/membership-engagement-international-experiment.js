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
        this.id = 'MembershipEngagementInternationalExperimentTest12';
        this.start = '2016-12-13'; //Tues 13th Dec
        this.expiry = '2017-1-6'; //Fri 6th Jan
        this.author = 'Rupert Bates';
        this.description = 'Test varying the number of visits before showing the membership engagement banner';
        this.audience = 1;    // 100% (of International audience)
        this.audienceOffset = 0;
        this.successMeasure = 'More membership sign-ups';
        this.audienceCriteria = '100 percent of (non-member) International edition readers';
        this.dataLinkNames = '';
        this.idealOutcome = 'More readers engage with the banner and then complete membership sign-up';
        this.hypothesis = 'Showing the banner to users who have visited us less frequently gives us a larger pool of potential supporters';

        this.canRun = function () {
            return config.page.edition.toLowerCase() === 'int' &&
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
                id: 'control',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: '1st_article',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: '3rd_article',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: '5th_article',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: '7th_article',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});
