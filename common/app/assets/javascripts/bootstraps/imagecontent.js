define([
    "utils/mediator",
    "modules/discussion/loader"
], function(
    mediator,
    DiscussionLoader
) {
    var modules = {

        initDiscussion: function() {
            mediator.on('page:imagecontent:ready', function(config, context) {
                if (config.page.commentable) {
                    var discussionLoader = new DiscussionLoader(context, mediator, {}, config.switches.discussionTopComments);
                    discussionLoader.attachToDefault();
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
