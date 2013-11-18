define([
    "utils/mediator",
    "modules/discussion/discussion"
], function(
    mediator,
    Discussion
) {
    var modules = {

        initDiscussion: function() {
            mediator.on('page:imagecontent:ready', function(config, context) {
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
            modules.initDiscussion();
        }
        mediator.emit("page:imagecontent:ready", config, context);
    };

    return {
        init: ready
    };

});
