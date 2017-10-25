// @flow
import {
    supportFrontendLiveInUk,
    supportFrontendLiveInUs,
} from 'common/modules/commercial/support-utilities';
import { getLocalCurrencySymbol } from 'lib/geolocation';

// control
const controlHeading = 'Since you’re here &hellip;';
const controlP1 =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And <span class="contributions__highlight">unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can</span>. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';
const controlP2FirstSentence =
    ' If everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure.';
const controlP2 = (currencySymbol: string) =>
    `${controlP2FirstSentence} <strong>For as little as ${currencySymbol}1, you can support the Guardian – and it only takes a minute. Thank you.</strong>`;

// control regulars
const controlHeadingRegulars = 'Hello again &hellip;';
const controlP1Regulars =
    '&hellip; today we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And <span class="contributions__highlight"> unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can</span>. So we think it’s fair to ask people who visit us often for their help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';

// US localised testimonials test
const usLocalisedFlagP1 = `${controlP1} Here’s why other <strong>readers from the US</strong> are supporting us:`;

// Just one pound (Oct 2017 test)
const justOnePoundP2 = (currencySymbol: string) =>
    `If everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure. <strong>For as little as ${currencySymbol}1, you can support the Guardian. Thank&nbsp;you.</strong>`;

const ctaLinkSentence = (
    membershipUrl: string,
    contributionUrl: string
): string => {
    if (supportFrontendLiveInUs) {
        return `Support the Guardian by <a href="${membershipUrl}" target="_blank" class="u-underline">making a contribution</a>`;
    } else if (supportFrontendLiveInUk) {
        return `You can support the Guardian by <a href="${membershipUrl}" target="_blank" class="u-underline">making a contribution or getting a subscription</a>`;
    }
    return `You can give to the Guardian by <a href="${membershipUrl}" target="_blank" class="u-underline">becoming a monthly supporter</a> or by making a <a href="${contributionUrl}" target="_blank" class="u-underline">one-off contribution</a>`;
};

/*
 Exported instances of AcquisitionsEpicTemplateCopy
 */
export const control: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: controlP1,
    p2: controlP2(getLocalCurrencySymbol()),
};

// For test, October 2017
export const oldControl: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: controlP1,
    p2: controlP2FirstSentence,
};

export const regulars: AcquisitionsEpicTemplateCopy = {
    heading: controlHeadingRegulars,
    p1: controlP1Regulars,
    p2: controlP2(getLocalCurrencySymbol()),
};

export const usLocalisedFlag = {
    heading: controlHeading,
    p1: usLocalisedFlagP1,
    p2: controlP2(getLocalCurrencySymbol()),
};

export const justAMinute: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: controlP1,
    p2: `${controlP2FirstSentence} <strong>Support the Guardian – it only takes a minute. Thank&nbsp;you.</strong>`,
};

export const justOnePound: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: controlP1,
    p2: justOnePoundP2(getLocalCurrencySymbol()),
};

export const liveblog = (
    membershipUrl: string,
    contributionsUrl: string
): AcquisitionsEpicTemplateCopy => ({
    p1: `Since you’re here ${controlP1}`,
    p2: `${controlP2FirstSentence} ${ctaLinkSentence(
        membershipUrl,
        contributionsUrl
    )}. - Guardian HQ`,
});
