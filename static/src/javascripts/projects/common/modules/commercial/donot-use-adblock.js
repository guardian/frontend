define([
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/commercial/user-features',
    'common/modules/ui/message',
    'common/modules/experiments/ab',
    'common/modules/navigation/navigation',
    'text!common/views/membership-message.html',
    'common/views/svgs',
    'lodash/collections/sample'
], function (
    _,
    config,
    detect,
    storage,
    template,
    userFeatures,
    Message,
    ab,
    navigation,
    messageTemplate,
    svgs,
    sample) {
    function init() {
        var alreadyVisted = storage.local.get('gu.alreadyVisited') || 0,
            adblockLink = 'https://membership.theguardian.com/supporter',
            message = sample([
                {
                    id: 'monthly',
                    messageText: 'We notice you\'re using an ad-blocker. Perhaps you\'ll support us another way? Become a Supporter from just £5 per month',
                    linkText: 'Find out more'
                },
                {
                    id: 'annual',
                    messageText: 'We notice you\'re using an ad-blocker. Perhaps you\'ll support us another way? Become a Supporter for just £50 per a year',
                    linkText: 'Find out more'
                },
                {
                    id: 'weekly',
                    messageText: 'We notice you\'re using an ad-blocker. Perhaps you\'ll support us another way? Become a Supporter for less than £1 per week',
                    linkText: 'Find out more'
                },
                {
                    id: 'no-price',
                    messageText: 'We notice you\'re using an ad-blocker. Perhaps you\'ll support us another way?',
                    linkText: 'Become a supporter today'
                }
            ]);

        if (detect.getBreakpoint() !== 'mobile' && detect.adblockInUse() && config.switches.adblock && alreadyVisted > 1 && !userFeatures.isPayingMember()) {
            new Message('adblock-message', {
                pinOnHide: false,
                siteMessageLinkName: 'adblock message variant ' + message.id,
                siteMessageCloseBtn: 'hide'
            }).show(template(messageTemplate, {
                linkHref: adblockLink + '?INTCMP=adb-mv-' + message.id,
                messageText: message.messageText,
                linkText: message.linkText,
                arrowWhiteRight: svgs('arrowWhiteRight')
            }));
        }
    }

    return {
        init: init
    };
});
