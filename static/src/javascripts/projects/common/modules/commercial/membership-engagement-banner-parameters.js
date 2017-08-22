// @flow
import config from 'lib/config';
import { getSupporterPaymentRegion } from 'lib/geolocation';

const baseParams = {
    minArticles: 3,
    colourStrategy() {
        return 'membership-prominent yellow';
    },
    campaignCode: 'gdnwb_copts_memco_banner',
};

const engagementBannerCopy = (cta: string): string =>
    `Unlike many others, we haven't put up a paywall &ndash; we want to keep our journalism as open as we can. ${cta}`;

// Prices taken from https://membership.theguardian.com/<region>/supporter
const monthlySupporterCost = (location: string): string => {
    const region = getSupporterPaymentRegion(location);

    if (region === 'EU') {
        // Format either 4.99 € or €4.99 depending on country
        // See https://en.wikipedia.org/wiki/Linguistic_issues_concerning_the_euro
        const euro = '€';
        const amount = '4.99';
        const euroAfterCountryCodes = [
            'BG',
            'HR',
            'CZ',
            'EE',
            'FI',
            'FR',
            'DE',
            'GR',
            'HU',
            'IS',
            'IT',
            'LV',
            'LT',
            'PL',
            'PT',
            'RO',
            'SK',
            'SI',
            'ES',
            'SE',
        ];

        return euroAfterCountryCodes.includes(location)
            ? `${amount} ${euro}`
            : euro + amount;
    }

    const payment = {
        GB: '£5',
        US: '$6.99',
        AU: '$10',
        CA: '$6.99',
        INT: '$6.99',
    }[region];

    return payment || '£5';
};

const supporterEngagementBannerCopy = (location: string): string =>
    engagementBannerCopy(
        `Support us for ${monthlySupporterCost(location)} per month.`
    );

const contributionEngagementBannerCopy = (): string =>
    engagementBannerCopy('Support us with a one-off contribution');

const supporterParams = (location: string): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Become a Supporter',
        linkUrl: 'https://membership.theguardian.com/supporter',
        products: ['MEMBERSHIP_SUPPORTER'],
        messageText: supporterEngagementBannerCopy(location),
        pageviewId: (config.ophan && config.ophan.pageViewId) || 'not_found',
    });

const contributionParams = (): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Make a Contribution',
        linkUrl: 'https://contribute.theguardian.com',
        products: ['CONTRIBUTION'],
        messageText: contributionEngagementBannerCopy(),
        pageviewId: (config.ophan && config.ophan.pageViewId) || 'not_found',
    });

export const engagementBannerParams = (
    location: string
): EngagementBannerParams =>
    location === 'US' ? contributionParams() : supporterParams(location);
