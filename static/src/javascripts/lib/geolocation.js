import Promise from 'Promise';
import fetch from 'lib/fetch-json';
import config from 'lib/config';
import storage from 'lib/storage';
let location;
const storageKey = 'gu.geolocation';
const editionToGeolocationMap = {
    'UK': 'GB',
    'US': 'US',
    'AU': 'AU'
};
const daysBeforeGeolocationRefresh = 10;

function init() {
    get().then(geolocation => {
        const currentDate = new Date();
        storage.local.set(storageKey, geolocation, {
            expires: currentDate.setDate(currentDate.getDate() + daysBeforeGeolocationRefresh)
        });
    });
}

function editionToGeolocation(editionKey) {
    return editionToGeolocationMap[editionKey] || 'GB';
}

function get() {
    return new Promise((resolve, reject) => {
        if (location) return resolve(location);
        else {
            fetch(config.page.ajaxUrl + '/geolocation', {
                method: 'GET',
                contentType: 'application/json',
                crossOrigin: true
            }).then(response => {
                if (response.country) {
                    location = response.country;
                    resolve(response.country);
                } else {
                    reject('No country in geolocation response', response);
                }
            }).catch(reject);
        }
    });
}

function getSync() {
    const geolocationFromStorage = storage.local.get(storageKey);
    return geolocationFromStorage ? geolocationFromStorage : editionToGeolocation(config.page.edition)
}

const regionCountryCodes = [
    'AU',
    'CA',
    'GB',
    'US'
];

const europeCountryCodes = [
    'AD',
    'AL',
    'AT',
    'BA',
    'BE',
    'BG',
    'BL',
    'CH',
    'CY',
    'CZ',
    'DE',
    'DK',
    'EE',
    'ES',
    'FI',
    'FO',
    'FR',
    'GF',
    'GL',
    'GP',
    'GR',
    'HR',
    'HU',
    'IE',
    'IT',
    'LI',
    'LT',
    'LU',
    'LV',
    'MC',
    'ME',
    'MF',
    'IS',
    'MQ',
    'MT',
    'NL',
    'NO',
    'PF',
    'PL',
    'PM',
    'PT',
    'RE',
    'RO',
    'RS',
    'SE',
    'SI',
    'SJ',
    'SK',
    'SM',
    'TF',
    'TR',
    'WF',
    'YT',
    'VA',
    'AX'
];

// Returns one of { GB, US, AU, CA, EU, INT }
// These are the different 'regions' we accept when taking payment.
// See https://membership.theguardian.com/uk/supporter# for more context.
function getSupporterPaymentRegion() {
    const location = getSync();
    if (regionCountryCodes.indexOf(location) > -1) {
        return location;
    }
    if (europeCountryCodes.indexOf(location) > -1) {
        return 'EU';
    }
    return 'INT';
}

function isInEurope() {
    const countryCode = getSync();
    return europeCountryCodes.indexOf(countryCode) > -1 || countryCode === 'GB'
}

export default {
    get,
    getSupporterPaymentRegion,
    getSync,
    isInEurope,
    init
};
