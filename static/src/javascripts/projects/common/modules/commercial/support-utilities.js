// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

const geo: string = geolocationGetSync();

const useSupportDomain = (): boolean =>
    geo === 'GB' || geo === 'US';

const supportPath = geo === 'US' ? '/us/contribute' : '/uk/contribute';

const supportBaseURL = useSupportDomain()
    ? `https://support.theguardian.com${supportPath}`
    : 'https://membership.theguardian.com/supporter';

export { useSupportDomain, supportBaseURL };
