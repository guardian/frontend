define([
    "common"
], function (
    common
    ) {

    function Interactive(nl, context, config) {

        var path = config.page.interactiveUrl + config.page.pageId,
            nodeList = nl;

        this.init = function () {

            // The contract here is that the interactive module MUST return an object
            // with a method called 'boot'.

            require(path + '/boot.js', function (interactive) {

                // We pass the standard context and config here, but also inject the
                // mediator so the external interactive can respond to our events.
                //
                // TODO Do we wrap the mediator in a facade? We don't want to much coupling.
            
                interactive.boot(nodeList, context, config, common.mediator);

            });
        };

    }

    return Interactive;

});
