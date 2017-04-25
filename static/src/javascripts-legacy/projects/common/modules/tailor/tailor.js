define([
    'common/modules/tailor/fetch-data'
], function(
    fetchData
) {

    /**
     * Given a response from tailor, we see if the response has a survey suggestion, and if so return the first
     * survey suggestion (there should only ever be one, but just in case).
     *
     * @returns {Promise.<Boolean>}
     */
    function getSuggestedSurvey(queryParams) {
        return fetchData('suggestions', false, queryParams).then(function(response) {
            if (response.suggestions) {
                var surveySuggestions = response.suggestions.filter(function (suggestion) {
                    return suggestion.class === 'SurveySuggestion';
                });

                if (surveySuggestions.length > 0) {
                    return surveySuggestions[0];
                }
            }
        });
    }

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
        isRegular: isRegular,
        getSuggestedSurvey: getSuggestedSurvey,
    };
});
