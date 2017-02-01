define([
    'common/utils/fetch-json'
], function(
    fetchJson
) {

    function getEmail(browserId) {
        return fetchJson('https://tailor.guardianapis.com/email/' + browserId, {
            method: 'get'
        })
    }

    return {
        getEmail: getEmail
    };

});
