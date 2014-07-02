define([
    'common/utils/config'
], function(
    config
) {

    var remarketingUrl = '//www.googleadservices.com/pagead/conversion.js';

    function load() {

        if (config.switches.remarketing) {

            window.google_conversion_id = 971225648;
            window.google_custom_params = window.google_tag_params;
            window.google_remarketing_only = true;

            return require(['js!' + remarketingUrl]);
        }
    }

    return {
        load: load
    };

});
