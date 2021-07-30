import {
    countryCodeToSupportInternationalisationId,
    getCountryCode,
} from '../../../../lib/geolocation';

/*
 * Inside the bundle:
 * - static/src/javascripts/projects/commercial/adblock-ask.ts
 *
 * Where is this file used outside the commercial bundle?
 * - static/src/javascripts/projects/common/modules/commercial/acquisitions-link-enrichment.js
 * - static/src/javascripts/projects/common/modules/commercial/support-utilities.spec.js
 *
 * - static/src/javascripts/projects/journalism/modules/audio-series-add-contributions.js
 *
 */



const addCountryGroupToSupportLink = (rawUrl) => {
    const countryCode = getCountryCode();
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
const supportContributeURL = () =>
    addCountryGroupToSupportLink(supportContributeGeoRedirectURL);
const supportSubscribeURL = () =>
    addCountryGroupToSupportLink(supportSubscribeGeoRedirectURL);
const supportSubscribeDigitalURL = () =>
    `${supportSubscribeURL()}/digital`;

export {
    supportContributeGeoRedirectURL,
    supportSubscribeGeoRedirectURL,
    supportContributeURL,
    supportSubscribeURL,
    supportSubscribeDigitalURL,
    addCountryGroupToSupportLink,
};
