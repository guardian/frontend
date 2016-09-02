define([
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/utils/fastdom-promise',
    'common/modules/ui/message',
    'common/modules/commercial/user-features',
    'common/views/svgs',
    'lodash/arrays/uniq',
    'text!common/views/experiments/weekend-reading-promo.html'
], function (
    config,
    storage,
    template,
    fastdomPromise,
    Message,
    userFeatures,
    svgs,
    uniq,
    weekendReadingPromo
) {
    return function () {
        this.id = 'WeekendReadingPromo';
        this.start = '2016-09-01';
        this.expiry = '2016-09-12';
        this.author = 'Kate Whalen';
        this.description = 'For just one pageview, show users a banner promoting the Weekend Reading email';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Find if there is demand for various Guardian digest offerings';
        this.audienceCriteria = '50% of visitors';
        this.dataLinkNames = 'habit forming digest promo';
        this.idealOutcome = 'Visitors click on the CTA and demonstrate demand for the feature';

        this.canRun = function () {
            console.log('running!');
            return !config.page.isAdvertisementFeature && config.page.contentType === 'Article';
        };

        function renderDigestSnap(messageText, linkText, linkHref, variantName) {
            var templateData = {
                linkText: linkText,
                messageText: messageText,
                linkHref: linkHref,
                variantName: variantName,
                arrowRight: svgs('arrowRight')
            };

            var cssModifierClass = 'weekendreading';

            var message = new Message('weekend-reading-message-09-16', {
                pinOnHide: false,
                siteMessageComponentName: 'weekend reading snap',
                siteMessageLinkName: 'weekend reading snap message',
                siteMessageCloseBtn: 'weekend reading snap hide',
                cssModifierClass: cssModifierClass
            });

            if (message.show(template(weekendReadingPromo, templateData))) {
                // Only mark the message as closed if it was actually shown
                // (i.e. there was no clash with another message)
                message.remember();
            }
        }

        this.variants = [
            {
                id: 'control',
                test: function () {
                    var messageText = 'Get the best reads of the week in your inbox every Saturday';
                    var linkText = 'Sign up';
                    var linkHref = '/survey/weekendreading?CMP=SnapBanner';
                    renderDigestSnap(messageText, linkText, linkHref, 'weekendReading');
                }
            }
        ];
    };
});
