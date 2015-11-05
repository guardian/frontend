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
        var originalMessage = new Message('membership-message-uk');
        var campaignCode = 'MEMBERSHIP_SUPPORTER_BANNER_UK';

        // Allow tracking to distinguish banners that have been re-displayed
        // after closing from those that have only been displayed once.
        if (originalMessage.hasSeen()) {
            campaignCode += '_REDISPLAYED';
        }

        // Previously this was called membership-message-uk. To redisplay it to users who have
        // already closed it, we appended '-redisplayed' to the name.
        new Message('membership-message-uk-redisplayed', {
            pinOnHide: false,
            siteMessageLinkName: 'membership message',
            siteMessageCloseBtn: 'hide'
        }).show(template(messageTemplate, {
            messageText: [
                'Thank you for reading the Guardian.',
                'Help keep our journalism free and independent by becoming a Supporter for just £5 a month.'
            ].join(' '),
            linkHref: 'https://membership.theguardian.com/supporter?INTCMP='+campaignCode,
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
