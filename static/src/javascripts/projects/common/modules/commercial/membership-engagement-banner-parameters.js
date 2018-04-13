// @flow
import config from 'lib/config';
import {
    getSupporterCountryGroup,
    extendedCurrencySymbol,
} from 'lib/geolocation';
import { supportContributeURL } from './support-utilities';

const baseParams = {
    minArticles: 3,
    colourStrategy() {
        return 'membership-progitminent yellow';
    },
    campaignCode: 'gdnwb_copts_memco_banner',
};

const engagementBannerCopy = (): string =>
    `<strong>Unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we
    can.</strong> The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to
    produce. But the revenue we get from advertising is falling, so we increasingly need our readers to fund us. If
    everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure.`;

const initialContribution = 1;

const supporterCost = (location: string): string => {
    const countryGroup = getSupporterCountryGroup(location);

    if (countryGroup === 'EURCountries') {
        // Format either 4.99 € or €4.99 depending on country
        // See https://en.wikipedia.org/wiki/Linguistic_issues_concerning_the_euro
        const euro = extendedCurrencySymbol.EURCountries;
        const amount = initialContribution;

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

    return `${extendedCurrencySymbol[countryGroup]}
            ${initialContribution}`;
};

const supporterEngagementCtaCopyJustOne = (location: string): string =>
    `Support The Guardian from as little as ${supporterCost(location)}.`;

export const engagementBannerParams = (
    location: string
): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Support The Guardian',
        linkUrl: supportContributeURL,
        products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
        messageText: engagementBannerCopy(),
        ctaText: supporterEngagementCtaCopyJustOne(location),
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
    });
