define([
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/ui/message',
    'common/modules/experiments/ab',
    'common/modules/navigation/navigation',
    'text!common/views/membership-message.html',
    'common/views/svgs'
], function (
    _,
    config,
    detect,
    storage,
    template,
    Message,
    ab,
    navigation,
    messageTemplate,
    svgs
) {
    function init() {
        var alreadyVisted = storage.local.get('alreadyVisited') || 0,
            adblockLink = 'https://membership.theguardian.com/',
            message = _.sample([
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

        if (detect.getBreakpoint() !== 'mobile' && detect.adblockInUse() && config.switches.adblock && alreadyVisted > 1) {
            new Message('adblock-message', {
                pinOnHide: false,
                siteMessageLinkName: 'adblock message variant ' + message.id,
                siteMessageCloseBtn: 'hide'
            }).show(template(messageTemplate, {
                supporterLink: adblockLink + '?INTCMP=adb-mv-' + message.id,
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
