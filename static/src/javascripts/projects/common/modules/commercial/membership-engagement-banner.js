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
    'common/utils/mediator',
    'Promise'
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
    mediator,
    Promise
) {

    var endpoints = {
        UK: 'https://membership.theguardian.com/uk/supporter',
        US: 'https://membership.theguardian.com/us/supporter',
        AU: 'https://membership.theguardian.com/au/supporter',
        INT: 'https://membership.theguardian.com/supporter'
    };

    // change messageCode to force redisplay of the message to users who already closed it.
    // messageCode is also consumed by .../test/javascripts/spec/common/commercial/membership-engagement-banner.spec.js
    var messageCode = 'engagement-banner-2016-10-12';

    var messages = {
        UK: {
            campaign: 'mem_uk_banner',
            messageText: 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for just £49 per year.'
        },
        US: {
            campaign: 'mem_us_banner',
            messageText: 'We need your help to support our fearless, independent journalism. Become a Guardian US Member for just $49 a year.'
        },
        AU: {
            campaign: 'mem_au_banner',
            messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia Member for just $100 a year.'
        },
        INT: {
            campaign: 'mem_int_banner',
            messageText: 'The Guardian’s voice is needed now more than ever. Support our journalism for just $49/€49 per year.'
        }
    };

    function formatEndpointUrl(edition, message) {
        return endpoints[edition] + '?INTCMP=' + message.campaign;
    }

    function show(edition, message) {
        var colours = ['default','vibrant-blue','yellow','light-blue','deep-purple','teal'];
        // Rotate through different colours on successive page views
        var colourIndex = storage.local.get('gu.alreadyVisited') % colours.length;
        var cssModifierClass = 'membership-message-' + colours[colourIndex];
        var linkHref = formatEndpointUrl(edition, message);
        var renderedBanner = template(messageTemplate, { messageText: message.messageText, linkHref: linkHref });
        var messageShown = new Message(
            messageCode,
            {
                pinOnHide: false,
                siteMessageLinkName: 'membership message',
                siteMessageCloseBtn: 'hide',
                siteMessageComponentName: message.campaign,
                trackDisplay: true,
                cssModifierClass: cssModifierClass
            }).show(renderedBanner);
        if (messageShown) {
            mediator.emit('membership-message:display');
        }
        mediator.emit('banner-message:complete');
        return messageShown;
    }

    function isInTest(testId, variant) {
        var participations = storage.local.get('gu.ab.participations');
        if (participations) {
            return variant === undefined ? participations[testId] : participations[testId].variant === variant;
        } else {
            return false;
        }
    }

    function init() {
        // block default behaviour for participants of the MembershipEngagementImmediate AB test
        var edition = config.page.edition;
        if (!(isInTest('MembershipEngagementImmediate') && edition.toLowerCase() === 'uk')) {
            var message = messages[edition];
            if (message) {
                var userHasMadeEnoughVisits = (storage.local.get('gu.alreadyVisited') || 0) >= 10;
                return commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {
                    if (canShow && userHasMadeEnoughVisits) {
                        show(edition, message);
                    }
                });
            }
        }
        return Promise.resolve();
    }

    return {
        init: init,
        messageCode: messageCode
    };

});
