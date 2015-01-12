define([
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/config'
], function (
    _,
    ajax,
    config
) {
    return function () {
        if (_.contains(['uk', 'us', 'au'], config.page.pageId) && config.switches.whatIsMyCityLoad) {
            ajax({
                url: '/weather/fake-what-is-my-city',
                type: 'json',
                method: 'get',
                crossOrigin: true
            });
        }
    };
});
