// @flow
import {
    countryToSupportInternationalisationId,
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
        countryToSupportInternationalisationId(getSync())
    );
const supportSubscribeLocalURL = (): string =>
    addCountryGroupToSupportLink(
        supportSubscribeGeoRedirectURL,
        countryToSupportInternationalisationId(getSync())
    );

export {
    supportContributeGeoRedirectURL,
    supportSubscribeGeoRedirectURL,
    supportContributeLocalURL,
    supportSubscribeLocalURL,
    addCountryGroupToSupportLink,
};
