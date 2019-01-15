// @flow
import config from 'lib/config';
import reportError from 'lib/report-error';
import { extendedCurrencySymbol, getSupporterCountryGroup, getSync as getGeoLocation, } from 'lib/geolocation';
import { supportContributeURL } from './support-utilities';
import { getBannerGoogleDoc } from './contributions-google-docs';

const engagementBannerControl: string = `<strong>The Guardian is editorially independent &ndash;
    our journalism is free from the influence of billionaire owners or politicians.
    No one edits our editor. No one steers our opinion.</strong> And unlike many others, we haven’t put
    up a paywall as we want to keep our journalism open and accessible. But the revenue we get from
    advertising is falling, so we increasingly need our readers to fund our independent, investigative reporting.`;

const supporterCost = (location: string, amount: number = 1): string => {
    const countryGroup = getSupporterCountryGroup(location);

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
        location
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
        hasTicker: false,
    };
};

export const getAcquisitionsBannerParams = (
    googleDocJson: any,
    sheetName: string
): ?EngagementBannerTemplateParams => {
    const rows =
        googleDocJson &&
        googleDocJson.sheets &&
        googleDocJson.sheets[sheetName];
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
            {
                feature: 'engagement-banner-test',
            },
            true
        );
    }

    const ctaText = `<span class="engagement-banner__highlight"> ${
        firstRow.ctaText
    }</span>`;

    const location = getGeoLocation();
    const paramsFromGoogleDoc: EngagementBannerTemplateParams = {
        messageText: firstRow.messageText,
        ctaText: ctaText.replace(
            /%%CURRENCY_SYMBOL%%/g,
            supporterCost(location, firstRow.askAmount)
        ),
        buttonCaption: firstRow.buttonCaption,
        linkUrl: firstRow.linkUrl,
        hasTicker: false,
    };

    return paramsFromGoogleDoc;
};

export const getControlEngagementBannerParams = (): Promise<?EngagementBannerTemplateParams> =>
    getBannerGoogleDoc().then(json =>
        getAcquisitionsBannerParams(json, 'control')
    );

export const getUserVariantParams = (
    userVariant: ?Variant
): Promise<?EngagementBannerParams> => {
    if (userVariant && userVariant.engagementBannerParams) {
        return userVariant.engagementBannerParams();
    }

    return Promise.resolve();
};
