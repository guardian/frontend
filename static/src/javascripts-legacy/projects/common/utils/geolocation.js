define([
    'Promise',
    'common/utils/fetch-json',
    'common/utils/config',
    'common/utils/storage'
], function (
    Promise,
    fetch,
    config,
    storage
) {
    var location;
    var storageKey = 'gu.geolocation'
    var editionToGeolocationMap = {
        'UK' : 'GB',
        'US' : 'US',
        'AU' : 'AU'
    };
    var daysBeforeGeolocationRefresh = 10;

    function init() {
        get().then(function (geolocation) {
            var currentDate = new Date();
            storage.local.set(storageKey, geolocation, {
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

    return {
        get: get,

        getSync: function() {
            var geolocationFromStorage = storage.local.get(storageKey);
            return geolocationFromStorage ? geolocationFromStorage : editionToGeolocation(config.page.edition)
        },

        init: init
    };
});
