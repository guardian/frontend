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

const engagementBannerCopy = (): string =>
    `<strong>Unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we
    can.</strong> The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to
    produce. But the revenue we get from advertising is falling, so we increasingly need our readers to fund us. If
    everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure.`;

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

const supporterEngagementCtaCopy = (location: string): string =>
    location === 'US'
        ? `Support us with a one-time contribution`
        : `Support us for ${monthlySupporterCost(location)} a month.`;

const supporterEngagementCtaCopyJustOne = (location: string): string =>
    location === 'US'
        ? 'Support the Guardian from as little as $1.'
        : 'Support the Guardian from as little as £1.';

const supporterParams = (location: string): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Support the Guardian',
        linkUrl: 'https://support.theguardian.com',
        products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
        messageText: engagementBannerCopy(),
        ctaText: supporterEngagementCtaCopyJustOne(location),
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
    });

const membershipSupporterParams = (location: string): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Become a Supporter',
        linkUrl: 'https://membership.theguardian.com/supporter',
        products: ['MEMBERSHIP_SUPPORTER'],
        messageText: engagementBannerCopy(),
        ctaText: supporterEngagementCtaCopy(location),
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
    });

export const engagementBannerParams = (
    location: string
): EngagementBannerParams => {
    if (location === 'US' || location === 'GB') {
        return supporterParams(location);
    }
    return membershipSupporterParams(location);
};
