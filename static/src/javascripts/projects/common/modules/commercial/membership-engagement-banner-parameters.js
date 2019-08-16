// @flow
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import { getEngagementBannerControlFromGoogleDoc } from 'common/modules/commercial/contributions-google-docs';
import config from 'lib/config';
import reportError from 'lib/report-error';
import { getLocalCurrencySymbolSync } from 'lib/geolocation';
import {
    supportContributeURL,
    addCountryGroupToSupportLink,
} from './support-utilities';

const fallbackCopy: string = `<strong>The Guardian is editorially independent &ndash;
    our journalism is free from the influence of billionaire owners or politicians.
    No one edits our editor. No one steers our opinion.</strong> And unlike many others, we haven’t put
    up a paywall as we want to keep our journalism open and accessible. But the revenue we get from
    advertising is falling, so we increasingly need our readers to fund our independent, investigative reporting.`;

const getAcquisitionsBannerParams = (
    rowsFromGoogleDoc: any
): EngagementBannerParams => {
    const firstRow = rowsFromGoogleDoc && rowsFromGoogleDoc[0];

    if (
        !(
            firstRow &&
            firstRow.messageText &&
            firstRow.ctaText &&
            firstRow.buttonCaption &&
            firstRow.linkUrl
        )
    ) {
        throw new Error(
            `Required data from the Google Doc was missing. Got row: ${firstRow}`
        );
    }

    const ctaText = `<span class="engagement-banner__highlight"> ${firstRow.ctaText.replace(
        /%%CURRENCY_SYMBOL%%/g,
        getLocalCurrencySymbolSync()
    )}</span>`;

    return {
        messageText: firstRow.messageText,
        ctaText,
        buttonCaption: firstRow.buttonCaption,
        linkUrl: addCountryGroupToSupportLink(firstRow.linkUrl),
        hasTicker: false,
        campaignCode: 'control_banner_from_google_doc',
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
        products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
        isHardcodedFallback: false,
        template: acquisitionsBannerControlTemplate,
        minArticlesBeforeShowingBanner: 3,
        userCohort: 'AllNonSupporters',
    };
};

export const getControlEngagementBannerParams = (): Promise<EngagementBannerParams> =>
    getEngagementBannerControlFromGoogleDoc()
        .then(rows => getAcquisitionsBannerParams(rows))
        .catch(err => {
            reportError(
                new Error(
                    `Could not fetch control banner copy from Google Doc. ${
                        err.message
                    }. Stack: ${err.stack}`
                ),
                {
                    feature: 'engagement-banner',
                },
                false
            );

            return {
                messageText: fallbackCopy,
                ctaText: `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${getLocalCurrencySymbolSync()}1</span>`,
                buttonCaption: 'Support The Guardian',
                linkUrl: supportContributeURL(),
                hasTicker: false,
                campaignCode: 'fallback_hardcoded_banner',
                pageviewId: config.get('ophan.pageViewId', 'not_found'),
                products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
                isHardcodedFallback: true,
                template: acquisitionsBannerControlTemplate,
                minArticlesBeforeShowingBanner: 3,
                userCohort: 'AllNonSupporters',
            };
        });
