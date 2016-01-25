define([
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/membership-message.html',
    'common/views/svgs',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/user-features',
    'lodash/objects/defaults'
], function (
    config,
    storage,
    template,
    Message,
    messageTemplate,
    svgs,
    commercialFeatures,
    userFeatures,
    defaults
) {

    var membershipEndpoints = {
        UK:   'https://membership.theguardian.com/supporter',
        US:   'https://membership.theguardian.com/us/supporter'
    };

    var defaultData = {
        arrowWhiteRight: svgs('arrowWhiteRight')
    };

    var messages = {
        UK: {
            campaign:      'MEMBERSHIP_SUPPORTER_BANNER_UK',
            code:          'membership-message-uk',
            minVisited:    10,
            data: {
                messageText: [
                    'Thank you for reading the Guardian.',
                    'Help keep our journalism fearless and independent by becoming a Supporter for just £5 a month.'
                ].join(' '),
                linkText: 'Join'
            }
        },
        US: {
            campaign:      'MEMBERSHIP_SUPPORTER_BANNER_US',
            code:          'membership-message-us',
            minVisited:    10,
            data: {
                messageText: 'Support open, independent journalism. Become a Supporter from just $5 per month',
                linkText: 'Find out more'
            }
        }
    };

    function canShow(message) {
        return (
            commercialFeatures.membershipMessages &&
            message.minVisited <= (storage.local.get('gu.alreadyVisited') || 0)
        );
    }

    function formatEndpointUrl(edition, message) {
        return membershipEndpoints[edition] + '?INTCMP=' + message.campaign;
    }

    function show(edition, message) {
        var originalMessage;

        var data = defaults({ linkHref: formatEndpointUrl(edition, message) }, message.data, defaultData);

        originalMessage = new Message(message.code);

        // Allow tracking to distinguish banners that have been re-displayed
        // after closing from those that have only been displayed once.
        if (originalMessage.hasSeen()) {
            message.code += '-redisplayed';
            message.campaign += '_REDISPLAYED';
            message.data.linkHref = formatEndpointUrl(edition, message);
        }

        return new Message(message.code, {
            pinOnHide: false,
            siteMessageLinkName: 'membership message',
            siteMessageCloseBtn: 'hide'
        }).show(template(messageTemplate, data));
    }

    function init() {
        var message = messages[config.page.edition];
        if (message && canShow(message)) {
            show(config.page.edition, message);
        }
    }

    return {
        init: init
    };
});
