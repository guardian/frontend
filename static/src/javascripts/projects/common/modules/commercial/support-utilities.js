// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

const useSupportDomain = (): boolean =>
    geolocationGetSync() === 'GB' || geolocationGetSync() === 'US';

const supportPath = geolocationGetSync() === 'US' ? '/us/contribute' : '/uk';

const supportBaseURL = useSupportDomain()
    ? `https://support.theguardian.com${supportPath}`
    : 'https://membership.theguardian.com/supporter';

const supportTestURL = (testName: string): string => {
    if (testName === 'sandc_circles') {
        const fromGeo = geolocationGetSync();
        if (fromGeo === 'US')
            return 'https://support.theguardian.com/us/contribute';
        if (fromGeo === 'GB')
            return 'https://support.theguardian.com/uk/contribute';
    }
    return supportBaseURL();
};

export { useSupportDomain, supportBaseURL, supportTestURL };
