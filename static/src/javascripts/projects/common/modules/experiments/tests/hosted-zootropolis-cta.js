define([
    'bean',
    'qwery',
    'common/utils/config',
    'common/utils/mediator'
], function (
    bean,
    qwery,
    config,
    mediator
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
        this.dataLinkNames = '';
        this.idealOutcome = 'People will click on the CTA banner more often.';

        this.canRun = function () {
            return config.page.tones === 'Hosted' && config.page.section === 'disney-zootropolis';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    console.log('inside control');
                },
                success: function (complete) {
                    bean.on(qwery('.hosted__next-video--tile')[0], 'click', complete);
                    bean.on(qwery('.hosted__container--full')[0], 'click', complete);
                }
            },
            {
                id: 'variant',
                test: function () {
                    console.log('inside variant');
                },
                success: function (complete) {
                    bean.on(qwery('.hosted__next-video--tile')[0], 'click', complete);
                    bean.on(qwery('.hosted__container--full')[0], 'click', complete);
                    bean.on(qwery('.hosted-next-autoplay__poster')[0], 'click', complete);
                    mediator.on('hosted video: autoredirect', complete);
                }
            }
        ];
    };
});
