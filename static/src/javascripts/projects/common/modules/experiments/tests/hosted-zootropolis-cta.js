define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/config'
], function (
    bean,
    qwery,
    $,
    config
) {
    return function () {
        this.id = 'HostedZootropolisCta';
        this.start = '2016-08-02';
        this.expiry = '2016-08-24';
        this.author = 'Zofia Korcz';
        this.description = 'Additional text on the Zootropolis CTA banner';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'People will click on the CTA banner more often.';
        this.audienceCriteria = 'All users on the hosted Zootropolis pages';
        this.dataLinkNames = 'disney-zootropolis';
        this.idealOutcome = 'People will click on the CTA banner more often.';

        this.canRun = function () {
            return config.page.tones === 'Hosted' && config.page.section === 'disney-zootropolis';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                },
                success: function (complete) {
                    bean.on(qwery('.hosted__cta-btn-wrapper')[0], 'click', complete);
                }
            },
            {
                id: 'variant',
                test: function () {
                    $('.hosted__cta-label').text('Disney’s Zootropolis: Download and keep today!');
                },
                success: function (complete) {
                    bean.on(qwery('.hosted__cta-btn-wrapper')[0], 'click', complete);
                }
            }
        ];
    };
});
