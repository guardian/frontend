// @flow
import {
    supportFrontendLiveInUk,
    supportFrontendLiveInUs,
} from 'common/modules/commercial/support-utilities';
import { getLocalCurrencySymbol } from 'lib/geolocation';

// control
const controlHeading = 'Since you’re here &hellip;';
const controlP1 =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';
const controlP2FirstSentence =
    ' If everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure.';
const controlP2 = (currencySymbol: string = getLocalCurrencySymbol()) =>
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
    membershipUrl: string,
    contributionUrl: string,
    currencySymbol: string
): string => {
    if (supportFrontendLiveInUs) {
        return `<span class="contributions__highlight"> For as little as ${
            currencySymbol
        }1, you can support the Guardian – and it only takes a minute.</span> <a href="${
            membershipUrl
        }" target="_blank" class="u-underline">Make a contribution</a>`;
    } else if (supportFrontendLiveInUk) {
        return `<span class="contributions__highlight">For as little as ${
            currencySymbol
        }1, you can support the Guardian – and it only takes a minute.</span> <a href="${
            membershipUrl
        }" target="_blank" class="u-underline">Make a contribution or get a subscription</a>`;
    }
    return `<span class="contributions__highlight"> For as little as ${
        currencySymbol
    }1, you can support the Guardian – and it only takes a minute.</span> <a href="${
        membershipUrl
    }" target="_blank" class="u-underline">Become a monthly supporter</a> or <a href="${
        contributionUrl
    }" target="_blank" class="u-underline">make a one-off contribution</a>`;
};

/*
 Exported instances of AcquisitionsEpicTemplateCopy
 */
export const control: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: controlP1,
    p2: controlP2(),
};

export const regulars: AcquisitionsEpicTemplateCopy = {
    heading: controlHeadingRegulars,
    p1: controlP1Regulars,
    p2: controlP2(),
};

export const endOfYearCountdown = (
    daysLeft: string
): AcquisitionsEpicTemplateCopy => ({
    heading: controlHeading,
    p1: `<strong>${
        daysLeft
    } left to give to the Guardian in 2017.</strong> More people are reading our independent, investigative journalism than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.`,
    p2: controlP2(),
});

export const asWeHeadInto2018: AcquisitionsEpicTemplateCopy = {
    heading: 'As we head into 2018 &hellip;',
    p1:
        '&hellip; Please consider giving to the Guardian. More people are reading our independent, investigative journalism than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too',
    p2: controlP2(),
};

export const liveblog = (
    membershipUrl: string,
    contributionsUrl: string
): AcquisitionsEpicTemplateCopy => ({
    p1: `Since you’re here ${controlP1}`,
    p2: `${controlP2FirstSentence} ${ctaLinkSentence(
        membershipUrl,
        contributionsUrl,
        getLocalCurrencySymbol()
    )}. - Guardian HQ`,
});
