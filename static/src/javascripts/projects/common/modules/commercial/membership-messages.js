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
        US:   'https://membership.theguardian.com/us/supporter',
        INT:   'https://membership.theguardian.com/supporter'
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
                messageText: 'Support open, independent journalism. Become a Supporter for just $4.99 per month',
                linkText: 'Find out more'
            }
        },
        INT: {
            campaign:      'MEMBERSHIP_SUPPORTER_BANNER_INT',
            code:          'membership-message-int',
            minVisited:    10,
            data: {
                messageText: [
                    'Support Guardian journalism and our coverage of critical, under-reported stories from around the world.',
                    'Become a Supporter for just $49/€49 per year.'
                ].join(' '),
                linkText: 'Find out more'
            }
        }
    };

    function checkWeCanShowMessage(message) {
        return commercialFeatures.async.membershipMessages.then(function (canShow) {
            return canShow && message.minVisited <= (storage.local.get('gu.alreadyVisited') || 0);
        });
    }

    function formatEndpointUrl(edition, message) {
        return membershipEndpoints[edition] + '?INTCMP=' + message.campaign;
    }

    function show(edition, message) {
        var data = defaults({ linkHref: formatEndpointUrl(edition, message) }, message.data, defaultData);

        return new Message(message.code, {
            pinOnHide: false,
            siteMessageLinkName: 'membership message',
            siteMessageCloseBtn: 'hide',
            cssModifierClass: 'membership-message'
        }).show(template(messageTemplate, data));
    }

    function init() {
        var message = messages[config.page.edition];
        if (message) {
            return checkWeCanShowMessage(message).then(function (weCanShowMessage) {
                if (weCanShowMessage) {
                    show(config.page.edition, message);
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
