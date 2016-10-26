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
        this.id = 'HostedOnwardJourney';
        this.start = '2016-10-24';
        this.expiry = '2016-12-20';
        this.author = 'Lydia Shepherd';
        this.description = 'Try two new designs for the onward journey component';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'The onward journey links are clicked more often.';
        this.audienceCriteria = '';
        this.dataLinkNames = 'Next Hosted Page: xyz';
        this.idealOutcome = 'One of the two new designs shows better click through rates than the current component';
        this.hypothesis = 'Showing more pages to the user means they are more likely to find another that they want to go to';

        this.canRun = function () {
            return config.page.isHosted && (
                    config.page.contentType == 'Article' || config.page.contentType == 'Video'
                ) && (
                    config.page.section == 'advertiser-content/chester-zoo-act-for-wildlife' ||
                    config.page.section == 'advertiser-content/lloyds-bank-wealth'
                );
        };

        var success = function (complete) {
            if (this.canRun()) {
                bean.on(document.body, 'click', '.js-hosted-onward-journey-link', complete)
            }
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: success.bind(this)
            },
            {
                id: 'carousel',
                test: function () {
                    $('.hosted-page')[0].classList.add('ab-test-variant-carousel');
                },
                success: success.bind(this)
            },
            {
                id: 'popup',
                test: function () {
                    $('.hosted-page')[0].classList.add('ab-test-variant-popup');
                },
                success: success.bind(this)
            }
        ];
    };
});
