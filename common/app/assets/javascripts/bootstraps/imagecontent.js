define([
    'common/utils/mediator',
    'common/modules/discussion/loader',
    'common/utils/$'
], function(
    mediator,
    DiscussionLoader,
    $
) {
    var modules = {

        initDiscussion: function() {
            mediator.on('page:imagecontent:ready', function(config, context) {
                if (config.page.commentable) {
                    var discussionLoader = new DiscussionLoader(context, mediator);
                    discussionLoader.attachTo($('.discussion')[0]);
                }
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.initDiscussion();
        }
        mediator.emit('page:imagecontent:ready', config, context);
    };

    return {
        init: ready
    };

});
