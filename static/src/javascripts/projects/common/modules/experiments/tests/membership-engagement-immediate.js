define([
    'bean',
    'qwery',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/membership-message.html',
    'common/modules/commercial/commercial-features',
    'common/utils/mediator'
], function (
    bean,
    qwery,
    config,
    storage,
    template,
    Message,
    messageTemplate,
    commercialFeatures,
    mediator
) {
    return function () {

        this.id = 'MembershipEngagementImmediate';
        this.start = '2016-10-14';
        this.expiry = '2016-10-16';
        this.author = 'Justin Pinner';
        this.description = 'Test if showing engagement banner to users with less than 10 page views drives additional contributions.';
        this.audience = 0.4;
        this.audienceOffset = 0;
        this.successMeasure = 'Conversion for membership';
        this.showForSensitive = false;
        this.audienceCriteria = 'Forty percent of uk edition readers (desktop and mobile web)';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.hypothesis = 'Although the conversion rate will likely drop slightly, we may see an uplift in the absolute value of contributions due to reaching a larger, and perhaps new audience segment.';

        this.canRun = function () {
            var matchesEdition = config.page.edition.toLowerCase() === 'uk';
            return commercialFeatures.canReasonablyAskForMoney && matchesEdition;
        };

        var makeMessage = function(id) {
            var linkHref = 'https://membership.theguardian.com/uk/supporter?INTCMP=' + id;
            var colours = ['default','vibrant-blue','yellow','light-blue','deep-purple','teal'];
            // Rotate through different colours on successive page views
            var colourIndex = storage.local.get('gu.alreadyVisited') % colours.length;
            var cssModifierClass = 'membership-message-' + colours[colourIndex];
            var messageText = 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for just £49 per year.';
            var renderedBanner = template(messageTemplate, {messageText: messageText, linkHref: linkHref});
            return new Message(
                // change this to redisplay banners to everyone who has previously closed them
                // 2016-10-12 matches the current PROD message id
                'engagement-banner-2016-10-12',
                {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide',
                    siteMessageComponentName: id,
                    trackDisplay: true,
                    cssModifierClass: cssModifierClass
                }).show(renderedBanner);

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
                test: function () {
                    var userHasMadeEnoughVisits = (storage.local.get('gu.alreadyVisited') || 0) >= 10;
                    if (userHasMadeEnoughVisits) {
                        commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {
                            if (canShow) {
                                var messageShown = makeMessage('mem_uk_banner_immediate_control');
                                if (messageShown) {
                                    mediator.emit('membership-message:display');
                                }
                                mediator.emit('banner-message:complete');
                            }
                        });
                    }
                },
                success: success.bind(this)
            },
            {
                id: 'immediate-display',
                test: function () {
                    commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {
                        if (canShow) {
                            var messageShown = makeMessage('mem_uk_banner_immediate_variant');
                            if (messageShown) {
                                mediator.emit('membership-message:display');
                            }
                            mediator.emit('banner-message:complete');
                        }
                    });
                },
                success: success.bind(this)
            }
        ];
    };
});
