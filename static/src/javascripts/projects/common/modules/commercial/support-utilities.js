// @flow
import {
    countryCodeToSupportInternationalisationId,
    getSync,
} from 'lib/geolocation';

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
const supportContributeLocalURL = (): string =>
    addCountryGroupToSupportLink(
        supportContributeGeoRedirectURL,
        countryCodeToSupportInternationalisationId(getSync())
    );
const supportSubscribeLocalURL = (): string =>
    addCountryGroupToSupportLink(
        supportSubscribeGeoRedirectURL,
        countryCodeToSupportInternationalisationId(getSync())
    );

export {
    supportContributeGeoRedirectURL,
    supportSubscribeGeoRedirectURL,
    supportContributeLocalURL,
    supportSubscribeLocalURL,
    addCountryGroupToSupportLink,
};
