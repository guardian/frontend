define([
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/ui/message',
    'common/modules/navigation/navigation',
    'text!common/views/donot-use-adblock.html',
    'common/views/svgs'
], function (
    detect,
    storage,
    template,
    Message,
    navigation,
    doNotUseAdblockTemplate,
    svgs
) {
    function init() {
        var alreadyVisted = storage.local.get('alreadyVisited') || 0,
            adblockLink = 'https://membership.theguardian.com/about/supporter?INTCMP=adb-mv';

        if (detect.getBreakpoint() !== 'mobile' && detect.adblockInUse && alreadyVisted) {
            new Message('adblock', {
                pinOnHide: false,
                siteMessageLinkName: 'adblock message variant',
                siteMessageCloseBtn: 'hide'
            }).show(template(
                    doNotUseAdblockTemplate,
                    {
                        adblockLink: adblockLink,
                        messageText: 'We notice you\'ve got an ad-blocker switched on. Perhaps you\'d like to support the Guardian another way?',
                        linkText: 'Become a supporter today',
                        arrowWhiteRight: svgs('arrowWhiteRight')
                    }
                ));
        }

        storage.local.set('alreadyVisited', alreadyVisted + 1);
    }

    return {
        init: init
    };
});
