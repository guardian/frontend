// @flow
import { countryToSupportInternationalisationId, getSync } from 'lib/geolocation';

const supportContributeURL = (): string =>
    `https://support.theguardian.com/${countryToSupportInternationalisationId(getSync())}/contribute`;
const supportContributeGeoRedirectURL = 'https://support.theguardian.com/contribute';
const supportSubscribeGeoRedirectURL = 'https://support.theguardian.com/subscribe';

export { supportContributeURL, supportContributeGeoRedirectURL, supportSubscribeGeoRedirectURL };
