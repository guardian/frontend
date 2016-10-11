define([
    'bean',
    'qwery',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/membership-message.html',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/user-features',
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
    userFeatures,
    mediator
) {
    var EditionTest = function (edition) {

        this.edition = edition;
        this.id = 'MembershipEngagementBannerTenPercent'+edition[0].toUpperCase() + edition.substr(1);
        this.start = '2016-10-12';
        this.expiry = '2016-10-14';
        this.author = 'Roberto Tyley';
        this.description = 'Show membership messages for the ' + edition + ' edition.';
        this.showForSensitive = false;
        this.audience = 0.1;
        this.audienceOffset = 0;
        this.successMeasure = 'Conversion for membership';
        this.audienceCriteria = 'Ten percent of users in the ' + edition + ' edition.';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.hypothesis = 'Although the conversion rate will likely drop slightly, we may see an uplift in the absolute value of contributions due to reaching a larger, and perhaps new audience segment.';

        var minVisited = 0;

        // Required by the A/B testing framework - can not be async, unfortunately
        this.canRun = function () {
            var matchesEdition = config.page.edition.toLowerCase() == edition;
            var userHasMadeEnoughVisits = (storage.local.get('gu.alreadyVisited') || 0) >= minVisited;
            return userHasMadeEnoughVisits && commercialFeatures.canReasonablyAskForMoney && matchesEdition;
        };

        this.completer = function (complete) {
            mediator.on('membership-message:display', function () {
                bean.on(qwery('#membership__engagement-message-link')[0], 'click', complete);
            });
        };

        this.variants = [];

    };

    EditionTest.prototype.addMessageVariant = function (id, messageText, linkHref, cssModifierClass) {
        var self = this;

        this.variants.push({
            id: id,
            test: function () {
                // async check to see if user has an ad-blocker enabled
                commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {
                    if (canShow && self.canRun()) {
                        var renderedBanner = template(messageTemplate, { messageText: messageText, linkHref: linkHref });
                        var messageShown = new Message(
                            'engagement-banner-2016-10-11', // change this to redisplay banners to everyone who has previously closed them
                            {
                                pinOnHide: false,
                                siteMessageLinkName: 'membership message',
                                siteMessageCloseBtn: 'hide',
                                siteMessageComponentName: id,
                                trackDisplay: true,
                                cssModifierClass: cssModifierClass
                            }).show(renderedBanner);
                        if (messageShown) {
                            mediator.emit('membership-message:display');
                        }
                        mediator.emit('banner-message:complete');
                    }
                });
            },
            success: this.completer
        });
        return this;
    };

    EditionTest.prototype.addMembershipVariant = function (suffix, messageText) {
        var id = 'mem_' + this.edition + '_banner_' + suffix;

        var colours = ['default','vibrant-blue','yellow','light-blue','deep-purple','teal'];

        // Rotate through different colours on successive page views
        var colourIndex = storage.local.get('gu.alreadyVisited') % colours.length;
        var cssModifierClass = 'membership-message-' + colours[colourIndex];

        return this.addMessageVariant(id, messageText, 'https://membership.theguardian.com/'+this.edition+'/supporter?INTCMP=' + id, cssModifierClass);
    };

    return [
        new EditionTest('uk')
            .addMembershipVariant('coffee', 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for just £49 per year.')
        ,new EditionTest('us')
            .addMembershipVariant('fearless', 'We need your help to support our fearless, independent journalism. Become a Guardian US Member for just $49 a year.')
            .addMembershipVariant('accountable', 'We’re accountable to readers, not shareholders. Support The Guardian for $49 a year.')
        ,new EditionTest('au')
            .addMembershipVariant('control', 'We need you to help support our fearless independent journalism. Become a Guardian Australia Member for just $100 a year.')
        ,new EditionTest('int')
            .addMembershipVariant('control', 'The Guardian’s voice is needed now more than ever. Support our journalism for just $49/€49 per year.')
    ];
});
