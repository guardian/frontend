import _ from 'underscore';
import authedAjax from 'modules/authed-ajax';
import vars from 'modules/vars';
import mediator from 'utils/mediator';

var detectPressFailureCount = 0;
var detectFailures = _.debounce(function (front) {
    var count = ++detectPressFailureCount;

    authedAjax.request({
        url: '/front/lastmodified/' + front
    })
    .always(function(resp) {
        var lastPressed;

        if (detectPressFailureCount === count && resp.status === 200) {
            lastPressed = new Date(resp.responseText);

            if (_.isDate(lastPressed)) {
                mediator.emit('presser:lastupdate', front, lastPressed);
            }
        }
    });
}, vars.CONST.detectPressFailureMs || 10000);

mediator.on('presser:detectfailures', function (front) {
    detectFailures(front);
});

export default function(env, front) {
    authedAjax.request({
        url: '/press/' + env + '/' + front,
        method: 'post'
    }).always(function () {
        if (env === 'live') {
            detectFailures(front);
        }
    });
}
