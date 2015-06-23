import {CONST} from 'modules/vars';
import * as panda from 'panda-session';

function locationRedirect() {
    window.location = '/logout';
}

export default function (overridePanda, overrideRedirect) {
    let redirect = overrideRedirect || locationRedirect,
        poll = function () {
            setTimeout(() => {
                reauth(overridePanda).then(poll).catch(redirect);
            }, CONST.reauthInterval);
        };

    poll();
}

var currentAction;
export function reauth (overridePanda) {
    let session = overridePanda || panda.reEstablishSession;

    if (!currentAction) {
        currentAction = session(CONST.reauthPath, CONST.reauthTimeout)
            .then(() => {
                currentAction = null;
            })
            .catch((ex) => {
                currentAction = null;
                throw ex;
            });
    }
    return currentAction;
}
