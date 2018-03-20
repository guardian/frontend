// @flow
import config from 'lib/config';
import { getSupporterPaymentRegion } from 'lib/geolocation';
import { supportBaseURL } from './support-utilities';

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
const supporterCost = (
    region: string,
    contributionType: 'MONTHLY' | 'ONE-OFF'
): string => {
    if (region === 'EU') {
        // Format either 4.99 € or €4.99 depending on country
        // See https://en.wikipedia.org/wiki/Linguistic_issues_concerning_the_euro
        const euro = '€';
        const amount = contributionType === 'MONTHLY' ? '4.99' : '1';

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
        MONTHLY: {
            GB: '£5',
            US: '$6.99',
            AU: '$10',
            CA: '$6.99',
            INT: '$6.99',
        },
        'ONE-OFF': {
            GB: '£1',
            US: '$1',
            AU: '$1',
            CA: '$1',
            INT: '$1',
        },
    }[contributionType][region];

    return payment || '£5';
};

const supporterEngagementCtaCopy = (region: string): string =>
    region === 'US'
        ? `Support us with a one-time contribution`
        : `Support us for ${supporterCost(region, 'MONTHLY')} a month.`;

const supporterEngagementCtaCopyJustOne = (region: string): string =>
    `Support The Guardian from as little as ${supporterCost(
        region,
        'ONE-OFF'
    )}.`;

const supporterParams = (region: string): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Support The Guardian',
        linkUrl: supportBaseURL,
        products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
        messageText: engagementBannerCopy(),
        ctaText: supporterEngagementCtaCopyJustOne(region),
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
    });

const membershipSupporterParams = (region: string): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Become a Supporter',
        linkUrl: 'https://membership.theguardian.com/supporter',
        products: ['MEMBERSHIP_SUPPORTER'],
        messageText: engagementBannerCopy(),
        ctaText: supporterEngagementCtaCopy(region),
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
    });

export const engagementBannerParams = (
    location: string
): EngagementBannerParams => {
    const region = getSupporterPaymentRegion(location);

    if (region === 'US' || region === 'GB' || region === 'EU') {
        return supporterParams(region);
    }
    return membershipSupporterParams(region);
};
