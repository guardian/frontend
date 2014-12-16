/* globals _ */
define([
    'knockout'
], function (
    ko
) {
    function IFrame (params) {
        var url = _.isFunction(params.src) ? params.src() : params.src;
        // we could proxy external URLs to /http/proxy/

        this.src = ko.observable(url, document.location);
    }

    return IFrame;
});
