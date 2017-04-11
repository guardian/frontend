define([
    'Promise',
    'lib/fetch-json',
    'lib/config',
    'lib/storage'
], function (
    Promise,
    fetch,
    config,
    storage
) {
    var location;
    var storageKey = 'gu.geolocation';
    var editionToGeolocationMap = {
        'UK' : 'GB',
        'US' : 'US',
        'AU' : 'AU'
    };
    var daysBeforeGeolocationRefresh = 10;

    function init() {
        get().then(function (geolocation) {
            var currentDate = new Date();
            storage.localStorage.set(storageKey, geolocation, {
                expires: currentDate.setDate(currentDate.getDate() + daysBeforeGeolocationRefresh)
            });
        });
    }

    function editionToGeolocation(editionKey) {
        return editionToGeolocationMap[editionKey] || 'GB';
    }

    function get() {
        return new Promise(function (resolve, reject) {
            if (location) return resolve(location);
            else {
                fetch(config.page.ajaxUrl + '/geolocation', {
                    method: 'GET',
                    contentType: 'application/json',
                    crossOrigin: true
                }).then(function (response) {
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
        var geolocationFromStorage = storage.localStorage.get(storageKey);
        return geolocationFromStorage ? geolocationFromStorage : editionToGeolocation(config.page.edition)
    }

    var regionCountryCodes = [
        'AU',
        'CA',
        'GB',
        'US'
    ];

    var europeCountryCodes = [
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
        var location = getSync();
        if (regionCountryCodes.indexOf(location) > -1) {
            return location;
        }
        if (europeCountryCodes.indexOf(location) > -1) {
            return 'EU';
        }
        return 'INT';
    }

    function isInEurope() {
        var countryCode = getSync();
        return europeCountryCodes.indexOf(countryCode) > -1 || countryCode === 'GB'
    }

    return {
        get: get,
        getSupporterPaymentRegion: getSupporterPaymentRegion,
        getSync: getSync,
        isInEurope: isInEurope,
        init: init
    };
});
