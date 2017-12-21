// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

const useSupportDomain = (): boolean =>
    geolocationGetSync() === 'GB' || geolocationGetSync() === 'US';

const supportBaseURL = useSupportDomain()
    ? 'https://support.theguardian.com'
    : 'https://membership.theguardian.com/supporter';

export { useSupportDomain, supportBaseURL };
