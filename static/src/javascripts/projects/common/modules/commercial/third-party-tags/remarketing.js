define([
    'common/utils/config'
], function (
    config
) {

    var remarketingUrl = 'http://www.googleadservices.com/pagead/conversion_async.js';

    function load() {

        if (config.switches.remarketing) {
            System.import(remarketingUrl + '!system-script').then(function () {
                /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
                window.google_trackConversion({
                    google_conversion_id: 971225648,
                    google_custom_params: window.google_tag_params,
                    google_remarketing_only: true
                });
            });
        }

    }

    return {
        load: load
    };

});
