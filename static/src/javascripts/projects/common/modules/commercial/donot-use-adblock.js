define([
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
            adblockLink = 'https://membership.theguardian.com?INTCMP=adb-mv';

        if (detect.getBreakpoint() !== 'mobile' && detect.adblockInUse && config.switches.adblock && alreadyVisted > 1) {
            new Message('adblock', {
                pinOnHide: false,
                siteMessageLinkName: 'adblock message variant',
                siteMessageCloseBtn: 'hide'
            }).show(template(
                    messageTemplate,
                    {
                        supporterLink: adblockLink,
                        messageText: 'We notice you\'ve got an ad-blocker switched on. Perhaps you\'d like to support the Guardian another way?',
                        linkText: 'Become a supporter today',
                        arrowWhiteRight: svgs('arrowWhiteRight')
                    }
                ));
        }
    }

    return {
        init: init
    };
});
