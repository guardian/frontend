define([
    'common/utils/fetch-json',
    'common/utils/cookies'
], function(
    fetchJson,
    cookies
) {

    var bwidCookie = cookies.get('bwid');

    function getEmailSuggestion() {
        if (!bwidCookie) {
            return;
        }

        return fetchJson('https://tailor.guardianapis.com/email/' + bwidCookie, {
            method: 'get'
        })
    }

    return {
        getEmailSuggestion: getEmailSuggestion
    };

});