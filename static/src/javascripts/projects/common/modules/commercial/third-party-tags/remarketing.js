define([
    'common/utils/config'
], function (
    config
) {

    var remarketingUrl = '//www.googleadservices.com/pagead/conversion_async.js';

    function load() {
        return require(['js!' + remarketingUrl], function () {
            window.google_trackConversion({
                google_conversion_id: 971225648,
                google_custom_params: window.google_tag_params,
                google_remarketing_only: true
            });
        });
    }

    return {
        shouldRun: config.switches.remarketing,
        load: load
    };

});
