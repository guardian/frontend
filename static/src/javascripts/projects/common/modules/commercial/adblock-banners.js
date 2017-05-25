// @flow
import config from 'lib/config';
import { inlineSvg } from 'common/views/svgs';

// this is used in all banners
const cursor = inlineSvg('cursor');

type BannersConfig = Array<{
    template: string,
    defaults: {},
    variants: Array<{}>,
    editions: {},
}>;

const banners: BannersConfig = [
    {
        template: 'adblock-sticky-message',

        defaults: {
            marque54icon: inlineSvg('marque54icon'),
            linkText: 'Find out more',
            cursor,
        },

        variants: [
            {
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_MONBIOT',
                quoteText: 'Become a Guardian Member and support independent journalism',
                quoteAuthor: 'George Monbiot',
                customCssClass: 'monbiot',
                imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/contributor/2015/7/9/1436429159376/George-Monbiot-L.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=903233b032379d7529d7337b8c26bcc9',
            },
            {
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_MUIR',
                quoteText: 'Support and become part of the Guardian',
                quoteAuthor: 'Hugh Muir',
                customCssClass: 'muir',
                imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/pictures/2014/3/13/1394733739000/HughMuir.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=c1eeb35230ad2a215ec9de76b3eb69fb',
            },
            {
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_TOYNBEE',
                quoteText: 'If you read the Guardian, join the Guardian',
                quoteAuthor: 'Polly Toynbee',
                customCssClass: 'toynbee',
                imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/contributor/2014/6/30/1404146756739/Polly-Toynbee-L.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=abf0ce1a1a7935e82612b330322f5fa4',
            },
            {
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_MACASKILL',
                quoteText: 'The Guardian enjoys rare freedom and independence. Support our journalism',
                quoteAuthor: 'Ewen MacAskill',
                customCssClass: 'macaskill',
                imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/contributor/2015/8/18/1439913873894/Ewen-MacAskill-R.png?w=300&q=85&auto=format&sharp=10&s=0ecfbc78dc606a01c0a9b04bd5ac7a82',
            },
        ],

        editions: {
            US: {
                messageText: 'Become a supporter from just $6.99 per month to ensure quality journalism is available to all',
                trackingSuffix: '_US',
            },
            AU: {
                messageText: 'Become a supporter from just £5 per month to ensure quality journalism is available to all',
                trackingSuffix: '_AU',
            },
        },
    },
    {
        template: 'adblock-sticky-message-coin',

        defaults: {
            cursor,
            customCssClass: '',
            rectangleLogo: inlineSvg('logomembership'),
            marque36icon: inlineSvg('marque36icon'),
        },

        variants: [
            {
                quoteText: 'Quality journalism',
                supporterLink: 'https://membership.theguardian.com/supporter?INTCMP=ADBLOCK_BANNER_COIN',
            },
        ],

        editions: {
            UK: {
                monthlyCost: '£5',
                dailyCost: '16p',
                adblockCoins: inlineSvg('adblockCoinsUk').replace(
                    '%%URL%%',
                    config.images.membership['adblock-coins']
                ),
            },
            INT: {
                monthlyCost: '$6.99',
                dailyCost: '22¢',
                adblockCoins: inlineSvg('adblockCoinsUs').replace(
                    '%%URL%%',
                    config.images.membership['adblock-coins-us']
                ),
            },
        },
    },
];

export { banners };
