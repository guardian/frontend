import config from 'lib/config';
import reportError from 'lib/report-error';
import { fetchPuzzlesData, renderBanner } from './contributions-service';

const messageCode = 'puzzles-banner';

let data = null;

const show = () => data ? renderBanner(data) : Promise.resolve(false);

const canShow = () => {
    const forceBanner = window.location.search.includes('force-remote-banner=true');
    const enabled = config.get('switches.remoteBanner') || forceBanner;

    if (!enabled) {
        return Promise.resolve(false);
    }

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
