define([], function () {

    function Search(config) {

        var gcsUrl;

        if (config.page.googleSearchUrl && config.page.googleSearchId) {
            gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;
        }

        this.init = function() {
            if (config.switches.googleSearch && gcsUrl) {
                require(['js!' + gcsUrl], function () {});
            }
        };
    }

    return Search;
});
