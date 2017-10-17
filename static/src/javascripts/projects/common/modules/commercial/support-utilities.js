// @flow

import config from 'lib/config';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const liveInUk =
    config.get('switches.ukSupporterTrafficToNewSupportFrontend') &&
    geolocationGetSync() === 'GB';
const liveInUs =
    config.get('switches.usSupporterTrafficToNewSupportFrontend') &&
    geolocationGetSync() === 'US';
const supportBaseURL = liveInUs
    ? 'https://support.theguardian.com/us/contribute'
    : 'https://support.theguardian.com/uk';
const supportButtonCaption = 'Support the Guardian';

const useSupportDomain = (): boolean => liveInUk || liveInUs;
const selectBaseUrl = (defaultUrl: string = supportBaseURL): string =>
    useSupportDomain() ? supportBaseURL : defaultUrl;
const selectEngagementBannerButtonCaption = (defaultCaption: string) =>
    useSupportDomain() ? supportButtonCaption : defaultCaption;

const liveBlogEpicSupportCtaLinkPara = (membershipUrlFromEpicTest: string, contributionUrlFromEpicTest: string): string => {
    /*
        The received URLs will be fully specified and parameterised, having been derived from the selectBaseUrl method
        defined above which would have been called from contributions-utilities. They will have already changed from
        membership.thegu... and contribute.thegu... to support.thegu... if appropriate
     */
    if (liveInUs) {
        return `Support the Guardian by <a href="${membershipUrlFromEpicTest}" target="_blank" class="u-underline">making a contribution</a>`;
    } else if (liveInUk) {
        return `You can support the Guardian by <a href="${membershipUrlFromEpicTest}" target="_blank" class="u-underline">making a contribution or getting a subscription</a>`;
    } else {
        return `You can give to the Guardian by <a href="${membershipUrlFromEpicTest}" target="_blank" class="u-underline">becoming a monthly supporter</a> or by making a <a href="${contributionUrlFromEpicTest}" target="_blank" class="u-underline">one-off contribution</a>`;
    }
};

export { useSupportDomain, liveBlogEpicSupportCtaLinkPara, selectBaseUrl, selectEngagementBannerButtonCaption };
