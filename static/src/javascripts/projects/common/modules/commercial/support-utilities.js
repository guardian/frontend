// @flow
import {
    getSync as geolocationGetSync,
    getSupporterCountryGroup as geolocationGetSupporterPaymentRegion,
} from 'lib/geolocation';

const geo: string = geolocationGetSync();
const geoCountryGroup = geolocationGetSupporterPaymentRegion(geo);

const useSupportDomain = (): boolean =>
    geoCountryGroup === 'GBPCountries' ||
    geoCountryGroup === 'UnitedStates' ||
    geoCountryGroup === 'EURCountries' ||
    geoCountryGroup === 'International' ||
    geoCountryGroup === 'NZDCountries' ||
    geoCountryGroup === 'Canada';

const supportBaseURL = useSupportDomain()
    ? 'https://support.theguardian.com/contribute'
    : 'https://membership.theguardian.com/supporter';

export { useSupportDomain, supportBaseURL };
