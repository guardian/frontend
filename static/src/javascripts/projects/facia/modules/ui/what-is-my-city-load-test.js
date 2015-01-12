define([
    'common/utils/ajax',
    'common/utils/config'
], function (
    ajax,
    config
) {
    if (config.switches.whatIsMyCityLoad) {
        ajax({
            url: '/weather/fake-what-is-my-city',
            type: 'json',
            method: 'get',
            crossOrigin: true
        });
    }
});
