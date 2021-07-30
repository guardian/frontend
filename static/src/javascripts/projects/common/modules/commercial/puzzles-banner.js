import reportError from 'lib/report-error';
import { fetchPuzzlesData, renderBanner } from './contributions-service';

/*
 * Where is this file used outside the commercial bundle?
 * - /static/src/javascripts/bootstraps/enhanced/common.js
 *
 * inside bundle
 * - /static/src/javascripts/projects/common/modules/commercial/contributions-service.js
 */

const messageCode = 'puzzles-banner';

let data = null;

const show = () => data ? renderBanner(data) : Promise.resolve(false);

const canShow = () => {

    return fetchPuzzlesData()
        .then((response)  => {
            if (response) {
                data = response;
                return true;
            }
            return false;
        }).catch(error => {
            console.log(`Error fetching remote puzzles banner data: ${error}`);
            reportError(new Error(`Error fetching remote puzzles banner data: ${error}`), {}, false);
            return false;
        });
};


export const puzzlesBanner = {
    id: messageCode,
    show,
    canShow,
};
