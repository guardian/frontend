define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/commercial/adblock-messages',
    'common/modules/commercial/adblock-banner-config',
    'common/modules/adblock-banner',
    'common/modules/onward/history',
    'common/modules/ui/message',
    'common/modules/experiments/ab',
    'common/modules/navigation/navigation',
    'text!common/views/membership-message.html',
    'common/views/svgs',
    'lodash/collections/sample'
], function (
    $,
    config,
    detect,
    storage,
    template,
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

