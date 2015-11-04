define([
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/membership-message.html',
    'common/views/svgs',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/user-features'
], function (
    config,
    storage,
    template,
    Message,
    messageTemplate,
    svgs,
    commercialFeatures,
    userFeatures
) {

    function canShowUkMessage() {
        var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;
        return (
            commercialFeatures.membershipMessages &&
            config.page.edition === 'UK' &&
            alreadyVisited > 10 &&
            !userFeatures.isPayingMember()
        );
    }

    function ukMessage() {
        new Message('membership-message-uk', {
            pinOnHide: false,
            siteMessageLinkName: 'membership message',
            siteMessageCloseBtn: 'hide'
        }).show(template(messageTemplate, {
            messageText: [
                'Thank you for reading the Guardian.',
                'Help keep our journalism free and independent by becoming a Supporter for just £5 a month.'
            ].join(' '),
            linkHref: 'https://membership.theguardian.com/supporter?INTCMP=MEMBERSHIP_SUPPORTER_BANNER_UK',
            linkText: 'Join',
            arrowWhiteRight: svgs('arrowWhiteRight')
        }));
    }

    function init() {
        if (canShowUkMessage()) {
            ukMessage();
        }
    }

    return {
        init: init
    };
});
