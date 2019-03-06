// @flow
import { getSupportInternationalisationIdSync } from 'lib/geolocation';

const supportContributeURL = (): string =>
    `https://support.theguardian.com/${getSupportInternationalisationIdSync()}/contribute`;
const supportContributeGeoRedirectURL = 'https://support.theguardian.com/contribute';
const supportSubscribeGeoRedirectURL = 'https://support.theguardian.com/subscribe';

export { supportContributeURL, supportContributeGeoRedirectURL, supportSubscribeGeoRedirectURL };
