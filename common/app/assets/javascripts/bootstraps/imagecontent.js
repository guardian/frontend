define([
    "common",
    "modules/discussion/discussion"
], function(
    common,
    Discussion
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
            modules.initDiscussion();
        }
        common.mediator.emit("page:imagecontent:ready", config, context);
    };

    return {
        init: ready
    };

});