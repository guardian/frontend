// @flow
import config from 'lib/config';
import {
    getSupporterCountryGroup,
    extendedCurrencySymbol,
} from 'lib/geolocation';
import { supportContributeURL } from './support-utilities';
import reportError from 'lib/report-error';
import { noop } from 'lib/noop';
import { getSync as getGeoLocation } from 'lib/geolocation';

const engagementBannerControl: string = `<strong>The Guardian is editorially independent &ndash;
    our journalism is free from the influence of billionaire owners or politicians.
    No one edits our editor. No one steers our opinion.</strong> And unlike many others, we haven’t put
    up a paywall as we want to keep our journalism open and accessible. But the revenue we get from
    advertising is falling, so we increasingly need our readers to fund our independent, investigative reporting.`;

const initialContribution = 1;

const supporterCost = (location: string, askAmount: number): string => {
    const countryGroup = getSupporterCountryGroup(location);
    const amount = askAmount ? askAmount : initialContribution;

    if (countryGroup === 'EURCountries') {
        // Format either 4.99 € or €4.99 depending on country
        // See https://en.wikipedia.org/wiki/Linguistic_issues_concerning_the_euro
        const euro = extendedCurrencySymbol.EURCountries;

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

    return `${extendedCurrencySymbol[countryGroup]}${amount}`;
};

const supporterEngagementCtaCopyControl = (location: string): string =>
    `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${supporterCost(
        location, initialContribution,
    )}.</span>`;

export const defaultEngagementBannerParams = (): EngagementBannerParams => {
    const location = getGeoLocation();
    return {
        campaignCode: 'gdnwb_copts_memco_banner',
        buttonCaption: 'Support The Guardian',
        linkUrl: supportContributeURL,
        messageText: engagementBannerControl,
        ctaText: supporterEngagementCtaCopyControl(location),
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
        products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
        buttonCaption: 'Support The Guardian',
    }
};

export const getAcquisitionsBannerParams = (
    googleDocJson: any,
    sheetName: string,
): EngagementBannerTemplateParams | {} => {
    const rows = googleDocJson && googleDocJson.sheets && googleDocJson.sheets[sheetName];
    const firstRow = rows && rows[0];

    if (
        !(
            firstRow &&
            firstRow.messageText &&
            firstRow.ctaText &&
            firstRow.askAmount &&
            firstRow.buttonCaption &&
            firstRow.linkUrl
        )
    ) {
        reportError(
            new Error('Could not fetch banner copy from Google Doc'),
            { feature: 'engagement-banner-test' }
        );
        return {};
    }

    const ctaText = `<span class="engagement-banner__highlight">${firstRow.ctaText}</span>`;

    const location = getGeoLocation();
    const paramsFromGoogleDoc: EngagementBannerTemplateParams = {
        messageText: firstRow.messageText,
        ctaText: ctaText.replace(
            /%%CURRENCY_SYMBOL%%/g, supporterCost(location, firstRow.askAmount)),
        buttonCaption: firstRow.buttonCaption,
        linkUrl: firstRow.linkUrl,
    };

    return paramsFromGoogleDoc;

};

export const getUserVariantTemplateParams = (
    userVariant: ?Variant,
): Promise<EngagementBannerTemplateParams | {} > => {
    if (
        userVariant &&
        userVariant.engagementBannerParams
    ) {
        return userVariant.engagementBannerParams();
    }

    return Promise.resolve({});
};
