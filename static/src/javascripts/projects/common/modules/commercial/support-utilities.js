// @flow
import { countryToSupportInternationalisationId, getSync, } from 'lib/geolocation';

const addCountryGroupToSupportLink = (
    rawUrl: string,
    countryGroup: string
): string =>
    rawUrl.replace(
        /(support.theguardian.com)\/(contribute|subscribe)/,
        (_, domain, path) => `${domain}/${countryGroup.toLowerCase()}/${path}`
    );

const supportContributeGeoRedirectURL =
    'https://support.theguardian.com/contribute';
const supportSubscribeGeoRedirectURL =
    'https://support.theguardian.com/subscribe';
const supportContributeURL = (): string =>
    addCountryGroupToSupportLink(
        supportContributeGeoRedirectURL,
        countryToSupportInternationalisationId(getSync())
    );
const supportSubscribeURL = (): string =>
    addCountryGroupToSupportLink(
        supportSubscribeGeoRedirectURL,
        countryToSupportInternationalisationId(getSync())
    );

export {
    supportContributeURL,
    supportContributeGeoRedirectURL,
    supportSubscribeGeoRedirectURL,
    addCountryGroupToSupportLink
};
