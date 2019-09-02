// @flow
import {
    countryCodeToSupportInternationalisationId,
    getFromStorage,
} from 'lib/geolocation';

// Will not change the link if there's no country code in localStorage
// (i.e. it bypasses the edition fallback of getSync from lib/geolocation)
const addCountryGroupToSupportLink = (rawUrl: string): string => {
    const countryCode = getFromStorage();
    if (countryCode) {
        const countryGroup = countryCodeToSupportInternationalisationId(
            countryCode
        );
        return rawUrl.replace(
            /(support.theguardian.com)\/(contribute|subscribe)/,
            (_, domain, path) =>
                `${domain}/${countryGroup.toLowerCase()}/${path}`
        );
    }

    return rawUrl;
};

const supportContributeGeoRedirectURL =
    'https://support.theguardian.com/contribute';
const supportSubscribeGeoRedirectURL =
    'https://support.theguardian.com/subscribe';
const supportContributeURL = (): string =>
    addCountryGroupToSupportLink(supportContributeGeoRedirectURL);
const supportSubscribeURL = (): string =>
    addCountryGroupToSupportLink(supportSubscribeGeoRedirectURL);
const supportSubscribeDigitalURL = (): string =>
    `${supportSubscribeURL()}/digital`;

export {
    supportContributeGeoRedirectURL,
    supportSubscribeGeoRedirectURL,
    supportContributeURL,
    supportSubscribeURL,
    supportSubscribeDigitalURL,
    addCountryGroupToSupportLink,
};
