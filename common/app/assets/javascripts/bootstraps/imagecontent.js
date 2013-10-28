define([
    "common"
], function(
    common
) {
    var modules = {

        initDiscussion: function() {
            common.mediator.on('page:imagecontent:ready', function(config, context) {
                if (config.page.commentable) {
                    var discussionArticle = new Discussion({
                        id: config.page.shortUrl,
                        context: context,
                        config: config
                    }).init();
                }
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            requirejs(['discussion'], function (D) {
                console.log('*** discussion has loaded via a requirejs call (image content)', D);
                //modules.initDiscussion();
                });
        }
        common.mediator.emit("page:imagecontent:ready", config, context);
    };

    return {
        init: ready
    };

});
