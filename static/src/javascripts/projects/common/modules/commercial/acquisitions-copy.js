// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';
import reportError from 'lib/report-error';

const controlCopyParagraphOne =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can. So you can see why we need to ask for your help.';

const controlCopyParagraphTwo =
    'The Guardian is editorially independent, meaning we set our own agenda. Our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. No one edits our Editor. No one steers our opinion. This is important because it enables us to give a voice to the voiceless, challenge the powerful and hold them to account. It’s what makes us different to so many others in the media, at a time when factual, honest reporting is critical.';

const controlCopyParagraphThree =
    'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.';

const liveblogMillionParagraphOne =
    '… three years ago we set out to make The Guardian sustainable by deepening our relationship with our readers. The same technologies that connected us with a global audience had also shifted advertising revenues away from news publishers. We decided to seek an approach that would allow us to keep our journalism open and accessible to everyone, regardless of where they live or what they can afford.';

const liveblogMillionParagraphTwo =
    'And now for the good news. Thanks to the one million readers who have supported our independent, investigative journalism through contributions, membership or subscriptions, The Guardian has overcome a perilous financial situation globally. But we have to maintain and build on that support for every year to come.';

const liveBlogMillionParagraphThree =
    'Sustained support from our readers enables us to continue pursuing difficult stories in challenging times of political upheaval, when factual reporting has never been more critical. The Guardian is editorially independent – our journalism is free from commercial bias and not influenced by billionaire owners, politicians or shareholders. No one edits our editor. No one steers our opinion. This is important because it enables us to give a voice to the voiceless, challenge the powerful and hold them to account. Readers’ support means we can continue bringing The Guardian’s independent journalism to the world.';

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

export const liveblogMillionCopy: AcquisitionsEpicTemplateCopy = {
    paragraphs: [
        'We have some news…',
        liveblogMillionParagraphOne,
        liveblogMillionParagraphTwo,
        liveBlogMillionParagraphThree,
        controlCopyParagraphThree,
    ],
    highlightedText: `For as little as ${getLocalCurrencySymbol()}1, you can support the Guardian – and it only takes a minute. Thank you.`,
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
