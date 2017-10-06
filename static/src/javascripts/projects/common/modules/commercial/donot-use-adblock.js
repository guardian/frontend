// @flow
import config from 'lib/config';
import template from 'lodash/utilities/template';
import mediator from 'lib/mediator';
import { showAdblockMsg } from 'common/modules/commercial/adblock-messages';
import { getBanners } from 'common/modules/commercial/adblock-banner-config';
import { AdblockBanner } from 'common/modules/adblock-banner';
import { Message } from 'common/modules/ui/message';
import messageTemplate from 'raw-loader!common/views/membership-message.html';
import { inlineSvg } from 'common/views/svgs';
import sample from 'lodash/collections/sample';

const showAdblockMessage = () => {
    const adblockLink = 'https://membership.theguardian.com/supporter';
    const messages = {
        UK: {
            campaign: 'ADB_UK',
            messageText: [
                "We notice you're using an ad-blocker. Perhaps you'll support us another way?",
                'Become a Supporter for less than £1 per week',
            ].join(' '),
            linkText: 'Find out more',
        },
        US: {
            campaign: 'ADB_US',
            messageText: [
                "We notice you're using an ad-blocker. Perhaps you'll support us another way?",
                'Become a Supporter for less than $1 per week',
            ].join(' '),
            linkText: 'Find out more',
        },
        INT: {
            campaign: 'ADB_INT',
            messageText: [
                "We notice you're using an ad-blocker. Perhaps you'll support us another way?",
                'Become a Supporter for less than $1/€1 per week',
            ].join(' '),
            linkText: 'Find out more',
        },
    };
    const message = messages[config.page.edition];

    if (message) {
        new Message('adblock-message-2016-06-15', {
            pinOnHide: false,
            siteMessageLinkName: 'adblock',
            siteMessageCloseBtn: 'hide',
            cssModifierClass: 'adblock-message',
        }).show(
            template(messageTemplate, {
                linkHref: `${adblockLink}?INTCMP=${message.campaign}`,
                messageText: message.messageText,
                linkText: message.linkText,
                arrowWhiteRight: inlineSvg('arrowWhiteRight'),
            })
        );
    }
};

const showAdblockBanner = () => {
    const banners = getBanners(config.page.edition);

    const flatBanners = [];
    banners.forEach(bannerList => {
        flatBanners.push(sample(bannerList));
    });

    const bannerToUse = sample(flatBanners);

    if (bannerToUse) {
        new AdblockBanner(bannerToUse.template, bannerToUse).show();
    }
};

const init = () => {
    showAdblockMsg().then(adBlockInUse => {
        // Show messages only if adblock is used by non paying member
        if (adBlockInUse) {
            showAdblockMessage();
            showAdblockBanner();
        }
        mediator.emit('banner-message:complete');
    });
};
export default {
    init,
};
