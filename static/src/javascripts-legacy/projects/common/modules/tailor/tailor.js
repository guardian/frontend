define([
    'lib/fetch-json'
], function(
    fetchJson
) {
    function getEmail(browserId) {
        return fetchJson('https://tailor.guardianapis.com/email/' + browserId +'?emailIds=39,3322,3039,1950,38,3698', {
            method: 'get'
        });
    }

    return {
        getEmail: getEmail
    };

});
