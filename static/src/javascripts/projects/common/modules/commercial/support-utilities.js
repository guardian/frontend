// @flow

import config from 'lib/config';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const supportBaseURL = 'https://support.theguardian.com/uk';
const supportButtonCaption = 'Support the Guardian';
const useSupportDomain = (): boolean =>
    config.get('switches.ukSupporterTrafficToNewSupportFrontend') &&
    geolocationGetSync() === 'GB';
const selectBaseUrl = (defaultUrl: string = supportBaseURL): string =>
    useSupportDomain() ? supportBaseURL : defaultUrl;
const selectEngagementBannerButtonCaption = (defaultCaption: string) =>
    useSupportDomain() ? supportButtonCaption : defaultCaption;

export { useSupportDomain, selectBaseUrl, selectEngagementBannerButtonCaption };
