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

    // change the message code to redisplay to people who have already seen it
    var messageCode = 'engagement-banner-2016-10-12';
    var minVisits = 10;

    var messages = {
        UK: {
            campaign: 'mem_uk_banner',
            code: messageCode,
            minVisits: minVisits,
            data: {
                messageText: 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for just £49 per year.',
                linkText: 'Find out more'
            }
        },
        US: {
            campaign: 'mem_us_banner',
            code: messageCode,
            minVisits: minVisits,
            data: {
                messageText: 'We need your help to support our fearless, independent journalism. Become a Guardian US Member for just $49 a year.',
                linkText: 'Find out more'
            }
        },
        AU: {
            campaign: 'mem_au_banner',
            code: messageCode,
            minVisits: minVisits,
            data: {
                messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia Member for just $100 a year.',
                linkText: 'Find out more'
            }
        },
        INT: {
            campaign: 'mem_int_banner',
            code: messageCode,
            minVisits: minVisits,
            data: {
                messageText: 'The Guardian’s voice is needed now more than ever. Support our journalism for just $49/€49 per year.',
                linkText: 'Find out more'
            }
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
        var renderedBanner = template(messageTemplate, { messageText: message.data.messageText, linkHref: linkHref });
        var messageShown = new Message(
            message.code,
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

    function init() {
        var edition = config.page.edition;
        var message = messages[edition];
        if (message) {
            var userHasMadeEnoughVisits = (storage.local.get('gu.alreadyVisited') || 0) >= message.minVisits;
            return commercialFeatures.async.canDisplayMembershipEngagementBanner.then(function (canShow) {
                if (canShow && userHasMadeEnoughVisits) {
                    show(edition, message);
                }
            });
        }
        return Promise.resolve();
    }

    return {
        init: init,
        messages: messages
    };

});
