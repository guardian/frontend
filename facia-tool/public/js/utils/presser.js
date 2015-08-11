import _ from 'underscore';
import {request} from 'modules/authed-ajax';
import {CONST} from 'modules/vars';
import mediator from 'utils/mediator';

var detectPressFailureCount = 0;
var detectFailures = _.debounce(function (front) {
    var count = ++detectPressFailureCount,
        parseResponse = function(resp) {
            var lastPressed;

            if (detectPressFailureCount === count && resp.status === 200) {
                lastPressed = new Date(resp.responseText);

                if (_.isDate(lastPressed)) {
                    mediator.emit('presser:lastupdate', front, lastPressed);
                }
            }
        };

    request({
        url: '/front/lastmodified/' + front
    })
    .then(parseResponse, parseResponse);

}, CONST.detectPressFailureMs || 10000);

mediator.on('presser:detectfailures', function (front) {
    detectFailures(front);
});

export default function(env, front) {
    return request({
        url: '/press/' + env + '/' + front,
        method: 'post'
    })
    .then(function () {
        if (env === 'live') {
            detectFailures(front);
        }
    })
    .catch(function () {});
}
