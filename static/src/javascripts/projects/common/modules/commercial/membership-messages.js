define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/identity/api',
    'common/modules/ui/message',
    'text!common/views/membership-message.html',
    'common/views/svgs'
], function (
    config,
    detect,
    storage,
    template,
    idApi,
    Message,
    messageTemplate,
    svgs
) {

    function canRun() {
        /**
         * - Exclude adblock users to avoid conflicts with similar adblock Supporter message
         * - Exclude mobile/small-screen devices
         * - Only show for UK edition
         * - Only show on Article pages
         * - Only show to visitors who have viewed more than 10 pages.
         */
        var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;
        return config.switches.membershipMessages &&
            !detect.adblockInUse() &&
            detect.getBreakpoint() !== 'mobile' &&
            config.page.edition === 'UK' &&
            config.page.contentType === 'Article' &&
            alreadyVisited > 10;
    }

    function showUkMessage() {
        new Message('membership-message-uk', {
            pinOnHide: false,
            siteMessageLinkName: 'membership message',
            siteMessageCloseBtn: 'hide'
        }).show(template(messageTemplate, {
            messageText: [
                'Thank you for reading The Guardian.',
                'Help keep our journalism free and independent by becoming a Supporter for just £5 a month.'
            ].join(' '),
            linkHref: 'https://membership.theguardian.com/about/supporter?INTCMP=MEMBERSHIP_SUPPORTER_BANNER_UK',
            linkText: 'Join',
            arrowWhiteRight: svgs('arrowWhiteRight')
        }));
    }

    function init() {
        if (canRun()) {
            showUkMessage();
        }
    }

    return {
        init: init
    };
});
