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

export const supportFrontendLiveInUk = liveInUk;
export const supportFrontendLiveInUs = liveInUs;
export {
    useSupportDomain,
    liveInUk,
    liveInUs,
    selectBaseUrl,
    selectEngagementBannerButtonCaption,
};
