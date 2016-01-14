define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/commercial/adblock-messages',
    'common/modules/adblock-banner',
    'common/modules/onward/history',
    'common/modules/ui/message',
    'common/modules/experiments/ab',
    'common/modules/navigation/navigation',
    'text!common/views/membership-message.html',
    'common/views/svgs',
    'lodash/collections/sample',
    'lodash/collections/filter',
    'lodash/collections/find'
], function (
    $,
    config,
    detect,
    storage,
    template,
    adblockMsg,
    AdblockBanner,
    history,
    Message,
    ab,
    navigation,
    messageTemplate,
    svgs,
    sample,
    filter,
    find) {
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
        var contributors = history.getContributors(),
            allVariations = [{
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_MONBIOT',
                quoteText: 'Become a Guardian Member and support independent journalism',
                quoteAuthor: 'George Monbiot',
                customCssClass: 'monbiot',
                imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/contributor/2015/7/9/1436429159376/George-Monbiot-L.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=903233b032379d7529d7337b8c26bcc9'
            },
            {
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_MUIR',
                quoteText: 'Support and become part of the Guardian',
                quoteAuthor: 'Hugh Muir',
                customCssClass: 'muir',
                imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/pictures/2014/3/13/1394733739000/HughMuir.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=c1eeb35230ad2a215ec9de76b3eb69fb'
            },
            {
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_TOYNBEE',
                quoteText: 'If you read the Guardian, join the Guardian',
                quoteAuthor: 'Polly Toynbee',
                customCssClass: 'toynbee',
                imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/contributor/2014/6/30/1404146756739/Polly-Toynbee-L.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=abf0ce1a1a7935e82612b330322f5fa4'
            },
            {
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_MACASKILL',
                quoteText: 'The Guardian enjoys rare freedom and independence. Support our journalism',
                quoteAuthor: 'Ewen MacAskill',
                customCssClass: 'macaskill',
                imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/contributor/2015/8/18/1439913873894/Ewen-MacAskill-R.png?w=300&q=85&auto=format&sharp=10&s=0ecfbc78dc606a01c0a9b04bd5ac7a82'
            }],

            variationsFromContributors = filter(allVariations, function (message) {
                return find(contributors, function (contributor) {
                    return contributor[0] === message.quoteAuthor;
                }) !== undefined;
            }),

            variationsToUse = variationsFromContributors.length > 1 ? variationsFromContributors : allVariations,
            variant = sample(variationsToUse);

        new AdblockBanner(variant).show();
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
