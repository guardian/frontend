define([
    'jquery',
    'modules/authed-ajax',
    'modules/vars',
    'utils/human-time'
], function (
    $,
    authedAjax,
    vars,
    humanTime
) {
    function getFrontAgeAlertMs(front) {
        return vars.CONST.frontAgeAlertMs[
            vars.CONST.highFrequencyPaths.indexOf(front) > -1 ? 'front' : vars.priority || 'editorial'
        ] || 600000;
    }

    function fetch(front) {
        var deferred = new $.Deferred();

        authedAjax.request({
            url: '/front/lastmodified/' + front
        })
        .always(function(resp) {
            if (resp.status === 200 && resp.responseText) {
                var date = new Date(resp.responseText);

                deferred.resolve({
                    date: date,
                    human: humanTime(date),
                    stale: new Date() - date > getFrontAgeAlertMs(front)
                });
            } else {
                deferred.resolve({});
            }
        });

        return deferred.promise();
    }

    return fetch;
});
