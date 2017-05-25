define([
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/storage',
    'lodash/utilities/template',
    'lib/mediator',
    'common/modules/commercial/adblock-messages',
    'common/modules/commercial/adblock-banner-config',
    'common/modules/adblock-banner',
    'common/modules/onward/history',
    'common/modules/ui/message',
    'common/modules/navigation/navigation',
    'raw-loader!common/views/membership-message.html',
    'common/views/svgs',
    'lodash/collections/sample'
], function (
    $,
    config,
    detect,
    storage,
    template,
    mediator,
    adblockMsg,
    adblockConfig,
    AdblockBanner,
    history,
    Message,
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
            new Message('adblock-message-2016-06-15', {
                pinOnHide: false,
                siteMessageLinkName: 'adblock',
                siteMessageCloseBtn: 'hide',
                cssModifierClass: 'adblock-message'
            }).show(template(messageTemplate, {
                linkHref: adblockLink + '?INTCMP=' + message.campaign,
                messageText: message.messageText,
                linkText: message.linkText,
                arrowWhiteRight: svgs.inlineSvg('arrowWhiteRight')
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
        adblockMsg.showAdblockMsg().then(function(adBlockInUse){
            // Show messages only if adblock is used by non paying member
            if (adBlockInUse) {
                showAdblockMessage();
                showAdblockBanner();
            }
            mediator.emit('banner-message:complete');
        });

    }
    return {
        init: init
    };
});
