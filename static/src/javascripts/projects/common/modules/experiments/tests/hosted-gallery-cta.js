define([
    'bean',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'lodash/collections/contains'
], function (
    bean,
    fastdom,
    qwery,
    $,
    config
) {
    return function () {
        this.id = 'HostedGalleryCta';
        this.start = '2016-08-12';
        this.expiry = '2016-09-16';
        this.author = 'Lydia Shepherd';
        this.description = 'Tests which image in the gallery the call to action link is most effective on';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'People will click on the call to action more often.';
        this.audienceCriteria = 'All users on hosted gallery pages';
        this.dataLinkNames = 'Find more inspiration';
        this.idealOutcome = 'People will click on the call to action link more often.';

        this.canRun = function () {
            return config.page.contentType === 'Gallery' && config.page.tones === 'Hosted' && config.page.images.length > 6;
        };

        this.variants = [
            {
                id: '3',
                test: function () {
                    config.page.ctaIndex = 2;
                },
                success: function (complete) {
                    var ctaButton = qwery('.hosted-gallery__cta-link');
                    if (ctaButton.length) {
                        bean.on(ctaButton[0], 'click', complete);
                    }
                }
            },
            {
                id: '4',
                test: function () {
                    config.page.ctaIndex = 3;
                },
                success: function (complete) {
                    var ctaButton = qwery('.hosted-gallery__cta-link');
                    if (ctaButton.length) {
                        bean.on(ctaButton[0], 'click', complete);
                    }
                }
            },
            {
                id: '5',
                test: function () {
                    config.page.ctaIndex = 4;
                },
                success: function (complete) {
                    var ctaButton = qwery('.hosted-gallery__cta-link');
                    if (ctaButton.length) {
                        bean.on(ctaButton[0], 'click', complete);
                    }
                }
            },
            {
                id: '6',
                test: function () {
                    config.page.ctaIndex = 5;
                },
                success: function (complete) {
                    var ctaButton = qwery('.hosted-gallery__cta-link');
                    if (ctaButton.length) {
                        bean.on(ctaButton[0], 'click', complete);
                    }
                }
            }
        ];
    };
});
