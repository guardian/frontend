define(['bean'], function (bean) {

    var Search = function (config) {

        var gcsUrl;

        if (config.page.googleSearchUrl && config.page.googleSearchId) {
            gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;
        }

        this.init = function() {
            if (config.switches.googleSearch && gcsUrl) {
                require(['js!' + gcsUrl + '!order'], function () {
                    bean.on(document.querySelector('.search-results'), 'click', function(e) {
                        var targetEl = e.target;
                        if (targetEl.nodeName.toLowerCase() === "a") {
                            targetEl.target = "_self";
                        }
                    });
                });
            }
        };
    };

    return Search;
});
