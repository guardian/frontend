// @flow
import config from 'lib/config';
import {
    getSupporterCountryGroup,
    extendedCurrencySymbol,
} from 'lib/geolocation';
import { supportContributeURL } from './support-utilities';

const baseParams = {
    minArticles: 3,
    campaignCode: 'gdnwb_copts_memco_banner',
};

const engagementBannerCopy: string = `<strong>The Guardian is editorially independent &ndash;
    our journalism is free from the influence of billionaire owners or politicians.
    No one edits our editor. No one steers our opinion.</strong> And unlike many others, we haven’t put
    up a paywall as we want to keep our journalism open and accessible. But the revenue we get from
    advertising is falling, so we increasingly need our readers to fund our independent, investigative reporting.`;

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

    return `${extendedCurrencySymbol[countryGroup]}${initialContribution}`;
};

const supporterEngagementCtaCopyControl = (location: string): string =>
    `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${supporterCost(
        location
    )}.</span>`;

export const engagementBannerParams = (
    location: string
): EngagementBannerParams =>
    Object.assign({}, baseParams, {
        buttonCaption: 'Support The Guardian',
        linkUrl: supportContributeURL,
        products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
        messageText: engagementBannerCopy,
        ctaText: supporterEngagementCtaCopyControl(location),
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
    });
