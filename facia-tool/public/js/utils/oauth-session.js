import {CONST} from 'modules/vars';
import {reEstablishSession} from 'panda-session';

function locationRedirect() {
    window.location = '/logout';
}

export default function (overridePanda, overrideRedirect) {
    let session = overridePanda || reEstablishSession,
        redirect = overrideRedirect || locationRedirect,
        poll = function () {
            setTimeout(function () {
                session(CONST.reauthPath, CONST.reauthInterval)
                .then(poll)
                .catch(redirect);
            }, CONST.reauthInterval);
        };

    poll();
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            session(CONST.reauthPath, CONST.reauthInterval).catch(redirect);
        }
    }, false);
}
