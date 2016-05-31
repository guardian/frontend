define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/modules/commercial/adblock-messages',
    'common/modules/commercial/adblock-banner-config',
    'common/modules/adblock-banner',
    'common/modules/onward/history',
    'common/modules/ui/message',
    'common/modules/experiments/ab',
    'common/modules/navigation/navigation',
    'tpl!common/views/membership-message.html',
    'common/views/svgs',
    'lodash/collections/sample'
], function (
    $,
    config,
    detect,
    storage,
    adblockMsg,
    adblockConfig,
    AdblockBanner,
    history,
    Message,
    ab,
    navigation,
    messageTemplate,
    svgs,
    sample
) {
    function showAdblockMessage() {
        var adblockLink = 'https://membership.theguardian.com/supporter',
            messages = {
                UK: {
                    campaign: 'ADB_UK',
                    messageText: [
                        'We notice you\'re using an ad-blocker. Perhaps you\'ll support us another way?',
                        'Become a Supporter for less than £1 per week'
                    ].join(' '),
                    linkText: 'Find out more'
                },
                US: {
                    campaign: 'ADB_US',
                    messageText: [
                        'We notice you\'re using an ad-blocker. Perhaps you\'ll support us another way?',
                        'Become a Supporter for less than $1 per week'
                    ].join(' '),
                    linkText: 'Find out more'
                },
                INT: {
                    campaign: 'ADB_INT',
                    messageText: [
                        'We notice you\'re using an ad-blocker. Perhaps you\'ll support us another way?',
                        'Become a Supporter for less than $1/€1 per week'
                    ].join(' '),
                    linkText: 'Find out more'
                }
            },
            message = messages[config.page.edition];

        if (message) {
            new Message('adblock-message', {
                pinOnHide: false,
                siteMessageLinkName: 'adblock',
                siteMessageCloseBtn: 'hide'
            }).show(messageTemplate({
                linkHref: adblockLink + '?INTCMP=' + message.campaign,
                messageText: message.messageText,
                linkText: message.linkText,
                arrowWhiteRight: svgs('arrowWhiteRight')
            }));
        }
    }

    function showAdblockBanner() {
        var banners = adblockConfig.getBanners(config.page.edition);

        var flatBanners = [];
        banners.forEach(function (bannerList) {
            flatBanners.push(sample(bannerList));
        });

        var bannerToUse = sample(flatBanners);

        if (bannerToUse) {
            new AdblockBanner(bannerToUse.template, bannerToUse).show();
        }
    }

    function init() {
        // Show messages only if adblock is used by non paying member
        if (adblockMsg.showAdblockMsg()) {
            showAdblockMessage();
            showAdblockBanner();
        }
    }

    return {
        init: init
    };
});
