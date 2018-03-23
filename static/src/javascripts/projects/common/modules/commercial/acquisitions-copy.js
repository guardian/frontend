// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';
import { useSupportDomain } from 'common/modules/commercial/support-utilities';
// control
const controlHeading = 'Since you’re here &hellip;';
const controlP1 =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';
const controlP2FirstSentence =
    ' If everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure.';
const controlP2 = (firstSentence: string, currencySymbol: string = getLocalCurrencySymbol()) =>
    `${
        controlP2FirstSentence
    } <strong><span class="contributions__highlight">For as little as ${
        currencySymbol
    }1, you can support the Guardian &ndash; and it only takes a minute. Thank you.</span></strong>`;

// control regulars
const controlHeadingRegulars = 'Hello again &hellip;';
const controlP1Regulars =
    '&hellip; today we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And <span class="contributions__highlight"> unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can</span>. So we think it’s fair to ask people who visit us often for their help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';

const ctaLinkSentence = (
    supportUrl: string,
    contributionUrl: string,
    currencySymbol: string
): string => {
    if (useSupportDomain()) {
        return `<span class="contributions__highlight"> For as little as ${
            currencySymbol
        }1, you can support the Guardian – and it only takes a minute.</span> <a href="${
            supportUrl
        }" target="_blank" class="u-underline">Make a contribution</a>`;
    }
    return `<span class="contributions__highlight"> For as little as ${
        currencySymbol
    }1, you can support the Guardian – and it only takes a minute.</span> <a href="${
        supportUrl
    }" target="_blank" class="u-underline">Become a monthly supporter</a> or <a href="${
        contributionUrl
    }" target="_blank" class="u-underline">make a one-off contribution</a>`;
};

const cambridgeP1 = '&hellip; now is the time to support investigative reporting. The Guardian and Observer have spent a year analysing documents, working with whistleblowers and gathering eyewitness reports to untangle a complex story of elections in the digital age. This took months of painstaking research by a small team of reporters and editors &ndash; and has led to investigations on both sides of the Atlantic. We have received legal threats, including from Facebook, but we are determined to continue publishing stories that expose wrongdoing and the use of people’s data for political purposes – from the US election to Brexit.'
const cambridgeP2FirstSentence = 'We increasingly need our readers to fund our fearless, independent, investigative reporting. Thank you to the many people who have already supported us financially &ndash; your contribution is what makes stories like this possible. Unlike many news organisations, we have not put up a paywall &ndash; we want to keep our journalism as open as we can.</br>';

/*
 Exported instances of AcquisitionsEpicTemplateCopy
 */
export const control: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: controlP1,
    p2: controlP2(controlP2FirstSentence),
};

export const regulars: AcquisitionsEpicTemplateCopy = {
    heading: controlHeadingRegulars,
    p1: controlP1Regulars,
    p2: controlP2(controlP2FirstSentence),
};

export const cambridgeCopy: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: cambridgeP1,
    p2: controlP2(cambridgeP2FirstSentence),
};

export const liveblogCopy = (
    supportUrl: string,
    contributionsUrl: string
): AcquisitionsEpicTemplateCopy => ({
    p1: `Since you’re here ${controlP1}`,
    p2: `${controlP2FirstSentence} ${ctaLinkSentence(
        supportUrl,
        contributionsUrl,
        getLocalCurrencySymbol()
    )}. - Guardian HQ`,
});
