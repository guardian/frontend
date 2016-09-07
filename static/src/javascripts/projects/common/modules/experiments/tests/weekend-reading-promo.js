define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/utils/storage',
    'common/utils/mediator',
    'common/modules/ui/message',
    'common/modules/user-prefs',
    'common/modules/commercial/user-features',
    'common/views/svgs',
    'text!common/views/experiments/weekend-reading-promo.html'
], function (
    config,
    detect,
    template,
    storage,
    mediator,
    Message,
    userPrefs,
    userFeatures,
    svgs,
    weekendReadingPromo
) {
    return function () {
        this.id = 'WeekendReadingPromo';
        this.start = '2016-09-01';
        this.expiry = '2016-09-12';
        this.author = 'Kate Whalen';
        this.description = 'For just one pageview, show users a banner promoting the Weekend Reading email';
        this.audience = 0.5;
        this.audienceOffset = 0;
        this.successMeasure = 'Snap banner promotes the Weekend Reading email and leads to visitors signing up';
        this.audienceCriteria = 'All visitors who have not yet seen this snap banner';
        this.dataLinkNames = 'weekend-reading-snap';
        this.idealOutcome = 'Visitors click on the CTA and sign-up to the Weekend Reading email';

        this.canRun = function () {
            return !config.page.isAdvertisementFeature &&
                config.page.contentType === 'Article' &&
                !isCompetingWithAdblockMessage() &&
                // we ran a similar Snap before, so do not show our new CTA to these users
                !hasSeenMessage('habit-digest-message-07-16');
        };

        // check to see if user has an ad-blocker enabled; we want the ad-block message to have priority
        function isCompetingWithAdblockMessage() {
            detect.adblockInUse.then(function (adblockUsed) {
                return adblockUsed;
            });
        }

        function hasSeenMessage(messageName) {
            var messageStates = userPrefs.get('messages');
            return messageStates && messageStates.indexOf(messageName) > -1;
        }

        function renderWeekendReadingSnap(messageText, linkText, linkHref, variantName) {
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
                siteMessageComponentName: 'weekend-reading-snap',
                siteMessageLinkName: 'weekend-reading-snap-message',
                siteMessageCloseBtn: 'weekend-reading-snap-hide',
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
                id: 'show',
                test: function () {
                    mediator.on('membership-message:complete', function () {
                        var messageText = 'Get the best reads of the week in your inbox every Saturday';
                        var linkText = 'Sign up';
                        var linkHref = '/signup/weekendreading?CMP=SnapBanner';
                        renderWeekendReadingSnap(messageText, linkText, linkHref, 'weekend-reading');
                    });
                }
            }
        ];
    };
});
