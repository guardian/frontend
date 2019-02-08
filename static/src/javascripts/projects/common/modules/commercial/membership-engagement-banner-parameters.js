// @flow
import config from 'lib/config';
import reportError from 'lib/report-error';
import { getLocalCurrencySymbol } from 'lib/geolocation';
import { getEngagementBannerControlFromGoogleDoc } from 'common/modules/commercial/contributions-google-docs';
import { supportContributeURL } from './support-utilities';

const fallbackCopy: string = `<strong>The Guardian is editorially independent &ndash;
    our journalism is free from the influence of billionaire owners or politicians.
    No one edits our editor. No one steers our opinion.</strong> And unlike many others, we haven’t put
    up a paywall as we want to keep our journalism open and accessible. But the revenue we get from
    advertising is falling, so we increasingly need our readers to fund our independent, investigative reporting.`;

const getAcquisitionsBannerParams = (
    rowsFromGoogleDoc: any
): ?EngagementBannerTemplateParams => {
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

    return {
        campaignCode: 'control_banner_from_google_doc',
        messageText: firstRow.messageText,
        ctaText: `<span class="engagement-banner__highlight"> ${firstRow.ctaText.replace(
            /%%CURRENCY_SYMBOL%%/g,
            getLocalCurrencySymbol()
        )}1</span>`,
        buttonCaption: firstRow.buttonCaption,
        linkUrl: firstRow.linkUrl,
        hasTicker: false,
    };
};

export const getControlEngagementBannerParams = (): Promise<?EngagementBannerTemplateParams> =>
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
                    feature: 'engagement-banner-test',
                },
                false
            );

            // The banner tests work by overriding built-in parameters.
            // So the default case is override nothing.
            // As opposed to the epic where we return default copy.
            // TODO: but could we return defaultEngagementBannerParams here?
            return {};
        });

export const defaultEngagementBannerParams = (): EngagementBannerParams => ({
    campaignCode: 'fallback_hardcoded_banner',
    buttonCaption: 'Support The Guardian',
    linkUrl: supportContributeURL,
    messageText: fallbackCopy,
    ctaText: `<span class="engagement-banner__highlight"> Support The Guardian from as little as ${getLocalCurrencySymbol()}1</span>`,
    pageviewId: config.get('ophan.pageViewId', 'not_found'),
    products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
    hasTicker: false,
});
