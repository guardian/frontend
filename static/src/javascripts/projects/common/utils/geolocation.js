define([
    'common/utils/fetch-json',
], function (
    fetch
) {
    var location;

    return {
        get: function() {
            return new Promise(function(resolve, reject) {
                if (location) return resolve(location);
                else {
                    fetch('https://api.nextgen.guardianapps.co.uk/geolocation', {
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
    };
});
