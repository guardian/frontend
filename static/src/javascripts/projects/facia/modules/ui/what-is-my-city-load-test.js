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
                url: '/weather/city.json',
                type: 'json',
                method: 'get',
                crossOrigin: true
            });
        }
    };
});
