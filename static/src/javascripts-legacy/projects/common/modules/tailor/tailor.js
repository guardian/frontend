define([
    'common/utils/fetch-json'
], function(
    fetchJson
) {
    function getEmail(browserId) {
        return fetchJson('https://tailor.guardianapis.com/email/' + browserId +'?emailIds=1950,218,3701', {
            method: 'get'
        });
    }

    return {
        getEmail: getEmail
    };

});
