// @flow
import {
    getSync as geolocationGetSync,
    getSupporterPaymentRegion as geolocationGetSupporterPaymentRegion,
} from 'lib/geolocation';

const geo: string = geolocationGetSync();
const geoCountryGroup = geolocationGetSupporterPaymentRegion(geo);

const useSupportDomain = (): boolean =>
    geoCountryGroup === 'GB' ||
    geoCountryGroup === 'US' ||
    geoCountryGroup === 'EU';

let supportPath = '/uk/contribute';
if (geoCountryGroup === 'US') {
    supportPath = '/us/contribute';
} else if (geoCountryGroup === 'EU') {
    supportPath = '/eu/contribute';
}

const supportBaseURL = useSupportDomain()
    ? `https://support.theguardian.com${supportPath}`
    : 'https://membership.theguardian.com/supporter';

export { useSupportDomain, supportBaseURL };
