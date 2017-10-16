// @flow

// control
const controlHeading = 'Since you’re here &hellip;';
const controlP1 =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And <span class="contributions__highlight">unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can</span>. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';
const controlP2 =
    ' If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.';

// control regulars
const controlHeadingRegulars = 'Hello again &hellip;';
const controlP1Regulars =
    '&hellip; today we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And <span class="contributions__highlight"> unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can</span>. So we think it’s fair to ask people who visit us often for their help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';

// US localised testimonials test
const usLocalisedFlagP1 = `${controlP1} Here’s why other <strong>readers from the US</strong> are supporting us:`;

/*
 Exported instances of AcquisitionsEpicTemplateCopy
 */
export const control: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: controlP1,
    p2: controlP2,
};

export const regulars: AcquisitionsEpicTemplateCopy = {
    heading: controlHeadingRegulars,
    p1: controlP1Regulars,
    p2: controlP2,
};

export const usLocalisedFlag = {
    heading: controlHeading,
    p1: usLocalisedFlagP1,
    p2: controlP2,
};

export const liveblog = (
    membershipUrl: string,
    contributionsUrl: string,
    useSupportDomain: boolean = false
): AcquisitionsEpicTemplateCopy => ({
    p1: `Since you’re here ${controlP1}`,
    p2: `${controlP2} ${useSupportDomain
        ? `You can support the Guardian by <a href="${membershipUrl}" target="_blank" class="u-underline">making a contribution or getting a subscription</a>.`
        : `You can give to the Guardian by <a href="${membershipUrl}" target="_blank" class="u-underline">becoming a monthly supporter</a> or by making a <a href="${contributionsUrl}" target="_blank" class="u-underline">one-off contribution</a>.`} - Guardian HQ`,
});
