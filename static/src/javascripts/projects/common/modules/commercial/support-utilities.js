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
    geoCountryGroup === 'EU' ||
    geoCountryGroup === 'INT';

const supportBaseURL = useSupportDomain()
    ? 'https://support.theguardian.com/contribute'
    : 'https://membership.theguardian.com/supporter';

export { useSupportDomain, supportBaseURL };
