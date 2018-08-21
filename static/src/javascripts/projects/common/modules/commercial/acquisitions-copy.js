// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';
import reportError from 'lib/report-error';

const controlHeading = 'Since you’re here &hellip;';

const controlFirstParagraph =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can. So you can see why we need to ask for your help.';
const controlLastParagraphInitialText =
    ' If everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure.';

const controlLastParagraph = (
    initialText: string,
    currencySymbol: string = getLocalCurrencySymbol()
) =>
    `${initialText} <strong><span class="contributions__highlight">For as little as ${currencySymbol}1, you can support the Guardian &ndash; and it only takes a minute. Thank you.</span></strong>`;

const fallbackControl = {
    heading: controlHeading,
    paragraphs: [
        controlFirstParagraph,
        controlLastParagraph(controlLastParagraphInitialText),
    ],
};

const liveblogWorldCupPlayfulFirstSentence =
    'Has our World Cup coverage made you feel peppier than a Jürgen Klopp team talk? Then help us by supporting our journalism.';

const liveblogWorldCupDepthFirstSentence =
    'We’re working hard to bring you an unbiased and in-depth view of the world’s most prestigious football tournament.  If you think that’s worth something, then please support our journalism.';

const ctaLinkSentence = (supportUrl: string, currencySymbol: string): string =>
    `<span class="contributions__highlight"> For as little as ${currencySymbol}1, you can support the Guardian – and it only takes a minute.</span> <a href="${supportUrl}" target="_blank" class="u-underline">Make a contribution</a>`;

const ctaLinkSentenceWorldCupLiveblogPlayful = (
    supportUrl: string,
    currencySymbol: string
): string =>
    `<span class="contributions__highlight"> For as little as ${currencySymbol}1, you can support the Guardian – and it only takes a minute.</span> Otherwise we’ll send Sergio Ramos round to sort you out. <a href="${supportUrl}" target="_blank" class="u-underline">Make a contribution</a>`;

export const getEpicParams = (
    googleDocJson: any,
    sheetName: string
): AcquisitionsEpicTemplateCopy => {
    const rows =
        googleDocJson &&
        googleDocJson.sheets &&
        googleDocJson.sheets[sheetName];
    const firstRow = rows && rows[0];

    if (
        !(
            firstRow &&
            firstRow.heading &&
            firstRow.paragraphs &&
            firstRow.highlightedText
        )
    ) {
        reportError(new Error('Could not fetch epic copy from Google Doc'), {
            feature: 'epic-test',
        });
        return fallbackControl;
    }

    return {
        heading: firstRow.heading,
        paragraphs: rows.map(row => row.paragraphs),
        highlightedText: firstRow.highlightedText.replace(
            /%%CURRENCY_SYMBOL%%/g,
            getLocalCurrencySymbol()
        ),
    };
};

/*
 Exported instances of AcquisitionsEpicTemplateCopy
 */

export const liveblogCopy = (
    supportUrl: string
): AcquisitionsEpicTemplateCopy => ({
    paragraphs: [
        `Since you’re here ${controlFirstParagraph}`,
        `${controlLastParagraphInitialText} ${ctaLinkSentence(
            supportUrl,
            getLocalCurrencySymbol()
        )}. - Guardian HQ`,
    ],
});

export const liveblogWorldCupPlayfulCopy = (
    supportUrl: string
): AcquisitionsEpicTemplateCopy => ({
    paragraphs: [
        `${liveblogWorldCupPlayfulFirstSentence} ${ctaLinkSentenceWorldCupLiveblogPlayful(
            supportUrl,
            getLocalCurrencySymbol()
        )}. - Guardian HQ`,
    ],
});

export const liveblogWorldCupDepthCopy = (
    supportUrl: string
): AcquisitionsEpicTemplateCopy => ({
    paragraphs: [
        `${liveblogWorldCupDepthFirstSentence} ${ctaLinkSentence(
            supportUrl,
            getLocalCurrencySymbol()
        )}. - Guardian HQ`,
    ],
});
