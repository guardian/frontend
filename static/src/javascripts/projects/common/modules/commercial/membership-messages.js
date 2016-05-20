define([
    'common/utils/config',
    'common/utils/storage',
    'common/modules/ui/message',
    'template!common/views/membership-message.html',
    'common/views/svgs',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/user-features',
    'lodash/objects/defaults',
    'Promise'
], function (
    config,
    storage,
    Message,
    messageTemplate,
    svgs,
    commercialFeatures,
    userFeatures,
    defaults,
    Promise
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
            // increment the number at the end of the code to redisplay banners
            // to everyone who has previously closed them
            code:          'membership-message-uk-2016-05-13',
            minVisited:    10,
            data: {
                messageText: [
                    'Support Guardian journalism and our coverage of critical, under-reported stories from around the world.',
                    'Become a Supporter for just £49 per year.'
                ].join(' '),
                linkText: 'Find out more'
            }
        },
        US: {
            campaign:      'MEMBERSHIP_SUPPORTER_BANNER_US',
            code:          'membership-message-us-2016-05-13',
            minVisited:    10,
            data: {
                messageText: 'Support open, independent journalism. Become a Supporter for just $4.99 per month',
                linkText: 'Find out more'
            }
        },
        INT: {
            campaign:      'MEMBERSHIP_SUPPORTER_BANNER_INT',
            code:          'membership-message-int-2016-05-13',
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

    var colours = {
        1: 'vibrant-blue',
        2: 'orange',
        3: 'light-blue',
        4: 'deep-purple',
        5: 'teal'
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
        // Rotate through six different colours on successive page views
        var colour = storage.local.get('gu.alreadyVisited') % 6;
        var cssModifierClass = 'membership-message';

        // 0 leaves it as the default colour set by the base class
        if (colour) {
            cssModifierClass += ('-' + colours[colour]);
        }

        return new Message(message.code, {
            pinOnHide: false,
            siteMessageLinkName: 'membership message',
            siteMessageCloseBtn: 'hide',
            cssModifierClass: cssModifierClass
        }).show(messageTemplate(data));
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
