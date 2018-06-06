// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';

// control
const controlHeading = 'Since you’re here &hellip;';
const controlP1 =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';
const controlP2FirstSentence =
    ' If everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure.';
const controlP2 = (
    firstSentence: string,
    currencySymbol: string = getLocalCurrencySymbol()
) =>
    `${
        firstSentence
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
): string =>
    `<span class="contributions__highlight"> For as little as ${
        currencySymbol
    }1, you can support the Guardian – and it only takes a minute.</span> <a href="${
        supportUrl
    }" target="_blank" class="u-underline">Make a contribution</a>`;

// double highlight
const controlP1Highlight =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. <span class="contributions__highlight">And unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can.</span> So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';

// drop ads falling
const dropAdsFallingP1 =
    '&hellip; we have a small favour to ask. Unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can. More people are reading the Guardian than ever but our independent, investigative journalism takes a lot of time, money and hard work to produce. So you can see why we need to ask for your help. We do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';

const thankyouP2FirstSentence =
    'Thank you to the many people who have already supported us financially &ndash; your contribution is what makes stories like you’ve just read possible. We increasingly need our readers to fund our work so that we can continue holding power to account and producing fearless journalism.</br></br>';

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

export const doubleHighlightCopy = {
    heading: controlHeading,
    p1: controlP1Highlight,
    p2: controlP2(controlP2FirstSentence),
};

export const dropAdsFallingCopy = {
    heading: controlHeading,
    p1: dropAdsFallingP1,
    p2: controlP2(controlP2FirstSentence),
};

export const thankyou = {
    heading: controlHeading,
    p1: controlP1,
    p2: controlP2(thankyouP2FirstSentence),
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
