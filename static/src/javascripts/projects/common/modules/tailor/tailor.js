// @flow
import { fetchData } from 'common/modules/tailor/fetch-data';

/**
 * Given a response from tailor, if there are surveys to show we randomly pick one to display
 */
const getSurvey = (queryParams: Object): Promise<any> =>
    fetchData('surveys', true, queryParams).then(response => {
        if (response) {
            return response[Math.floor(Math.random() * response.length)];
        }
    });

/**
 * Query the user's regular status
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

export { isRegular, getSurvey };
