define([
    'underscore',
    'modules/authed-ajax',
    'modules/vars',
    'utils/mediator'
], function (
    _,
    authedAjax,
    vars,
    mediator
) {
    var detectPressFailureCount = 0;

    function press (env, front) {
        authedAjax.request({
            url: '/press/' + env + '/' + front,
            method: 'post'
        }).always(function () {
            if (env === 'live') {
                detectFailures(front);
            }
        });
    }

    mediator.on('presser:detectfailures', function (front) {
        detectFailures(front);
    });

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

    return {
        pressDraft: press.bind(null, 'draft'),
        pressLive: press.bind(null, 'live')
    };
});
