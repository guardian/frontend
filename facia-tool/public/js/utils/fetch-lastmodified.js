import Promise from 'Promise';
import authedAjax from 'modules/authed-ajax';
import vars from 'modules/vars';
import humanTime from 'utils/human-time';

function getFrontAgeAlertMs(front) {
    return vars.CONST.frontAgeAlertMs[
        vars.CONST.highFrequencyPaths.indexOf(front) > -1 ? 'front' : vars.priority || 'editorial'
    ] || 600000;
}

export default function(front) {
    return new Promise(function (resolve) {
        authedAjax.request({
            url: '/front/lastmodified/' + front
        })
        .always(function(resp) {
            if (resp.status === 200 && resp.responseText) {
                var date = new Date(resp.responseText);

                resolve({
                    date: date,
                    human: humanTime(date),
                    stale: new Date() - date > getFrontAgeAlertMs(front)
                });
            } else {
                resolve({});
            }
        });
    });
}
