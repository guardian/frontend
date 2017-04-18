define([
    'common/modules/tailor/tailor'
], function(
    fetchData
) {

    /**
     * Query the user's regular status
     *
     * @returns {Promise.<Boolean>}
     */
    function isRegular() {
        return fetchData('suggestions', false).then(function(suggestions) {
            try {
                return suggestions.userDataForClient.regular;
            } catch (e) {
                return false;
            }
        }).catch(function() {
            return false;
        });
    }

    return {
        isRegular: isRegular
    };
});
