// @flow

import config from 'lib/config';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const supportBaseURL = 'https://support.theguardian.com/uk';
const useSupportDomain = (): boolean =>
    config.get('switches.ukSupporterTrafficToNewSupportFrontend') &&
    geolocationGetSync() === 'GB';
const selectBaseUrl = (defaultUrl: string = supportBaseURL): string =>
    useSupportDomain() ? supportBaseURL : defaultUrl;

export {
    useSupportDomain,
    selectBaseUrl,
};
