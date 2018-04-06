// @flow
import config from 'lib/config';
import {
    getSupporterCountryGroup,
    extendedCurrencySymbol,
} from 'lib/geolocation';
import type { CountryGroupId } from 'lib/geolocation';
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

const paymentAmounts = {
    MONTHLY: {
        GBPCountries: '5',
        UnitedStates: '6.99',
        AUDCountries: '10',
        Canada: '6.99',
        International: '6.99',
        NZDCountries: '10',
        EURCountries: '4.99',
    },
    'ONE-OFF': {
        GBPCountries: '1',
        UnitedStates: '1',
        AUDCountries: '1',
        Canada: '1',
        International: '1',
        NZDCountries: '1',
        EURCountries: '1',
    },
};

const supporterCost = (
    location: string,
    contributionType: 'MONTHLY' | 'ONE-OFF'
): string => {
    const region = getSupporterCountryGroup(location);

    if (region === 'EURCountries') {
        // Format either 4.99 € or €4.99 depending on country
        // See https://en.wikipedia.org/wiki/Linguistic_issues_concerning_the_euro
        const euro = extendedCurrencySymbol.EURCountries;
        const amount = paymentAmounts[contributionType].EURCountries;

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

    return `${extendedCurrencySymbol[region]}
            ${paymentAmounts[contributionType][region]}`;
};

const supporterEngagementCtaCopy = (location: string): string =>
    `Support us for ${supporterCost(location, 'MONTHLY')} a month.`;

const supporterEngagementCtaCopyJustOne = (location: string): string =>
    `Support The Guardian from as little as ${supporterCost(
        location,
        'ONE-OFF'
    )}.`;

const supporterParams = (location: string): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Support The Guardian',
        linkUrl: supportBaseURL,
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
    const region = getSupporterCountryGroup(location);
    const supportRegions: CountryGroupId[] = [
        'UnitedStates',
        'GBPCountries',
        'EURCountries',
        'International',
        'NZDCountries',
        'Canada',
    ];
    if (supportRegions.includes(region)) {
        return supporterParams(location);
    }
    return membershipSupporterParams(location);
};
