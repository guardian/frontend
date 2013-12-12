define([
    '$',
    'common',
    'modules/identity/api',
    'utils/ajax'
], function (
    $,
    common,
    idApi,
    ajax
) {

    function Formstack(el, context, config) {

        config = common.extend({
            readyClass: 'form-ready'
        }, config);

        this.init = function() {
            if (!$(el).hasClass(config.readyClass)) {

                // User object required to populate fields
                var user = idApi.getUserOrSignIn();
                this.decorate();

                $(el).addClass(config.readyClass);
            }
        };

        this.decorate = function() {
            // Style form
        };

    }

    return Formstack;

});
