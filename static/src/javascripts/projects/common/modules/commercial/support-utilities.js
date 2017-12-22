// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

const useSupportDomain = (): boolean =>
    geolocationGetSync() === 'GB' || geolocationGetSync() === 'US';

const supportPath = geolocationGetSync() === 'US' ? '/us/contribute' : '/uk';

const supportBaseURL = useSupportDomain()
    ? `https://support.theguardian.com${supportPath}`
    : 'https://membership.theguardian.com/supporter';

export { useSupportDomain, supportBaseURL };
