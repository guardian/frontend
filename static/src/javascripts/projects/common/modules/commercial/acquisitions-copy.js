// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';
import reportError from 'lib/report-error';

const controlCopyParagraphOne =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can. So you can see why we need to ask for your help.';

const controlCopyParagraphTwo =
    'The Guardian is editorially independent, meaning we set our own agenda. Our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. No one edits our Editor. No one steers our opinion. This is important because it enables us to give a voice to the voiceless, challenge the powerful and hold them to account. It’s what makes us different to so many others in the media, at a time when factual, honest reporting is critical.';

const controlCopyParagraphThree =
    'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.';

// used when Google Doc control cannot be fetched
export const articleCopy = {
    heading: 'Since you’re here &hellip;',
    paragraphs: [
        controlCopyParagraphOne,
        controlCopyParagraphTwo,
        controlCopyParagraphThree,
    ],
    highlightedText: `For as little as ${getLocalCurrencySymbol()}1, you can support the Guardian &ndash; and it only takes a minute. Thank you.`,
};

export const liveblogCopy: AcquisitionsEpicTemplateCopy = {
    paragraphs: [
        `Since you’re here ${controlCopyParagraphOne}`,
        controlCopyParagraphTwo,
        controlCopyParagraphThree,
    ],
    highlightedText: `For as little as ${getLocalCurrencySymbol()}1, you can support the Guardian – and it only takes a minute.`,
};

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
        return articleCopy;
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
