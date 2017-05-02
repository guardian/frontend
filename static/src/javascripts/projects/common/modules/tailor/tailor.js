// @flow
import fetchData from 'common/modules/tailor/fetch-data';

/**
 * Given a response from tailor, we see if the response has a survey suggestion, and if so return the first
 * survey suggestion (there should only ever be one, but just in case).
 *
 * @returns {Promise.<Boolean>}
 */
const getSuggestedSurvey = (queryParams: Object): Promise<any> =>
    fetchData('suggestions', false, queryParams).then(response => {
        if (response.suggestions) {
            const surveySuggestions = response.suggestions.filter(
                suggestion => suggestion.class === 'SurveySuggestion'
            );

            if (surveySuggestions.length > 0) {
                return surveySuggestions[0];
            }
        }
    });

/**
 * Query the user's regular status
 *
 * @returns {Promise.<Boolean>}
 */
const isRegular = (): Promise<boolean> =>
    fetchData('suggestions', false)
        .then(suggestions => {
            try {
                return suggestions.userDataForClient.regular;
            } catch (e) {
                return false;
            }
        })
        .catch(() => false);

export { isRegular, getSuggestedSurvey };
