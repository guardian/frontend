define([
    //Common libraries
    "common",
    //Modules
    "modules/masthead-relative-dates",
    'modules/top-stories-show-more',
    'modules/facia-popular'
], function (
    common,
    mastheadRelativeDates,
    TopStoriesShowMore,
    faciaPopular
) {

    var modules = {

        relativiseMastheadDates: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                mastheadRelativeDates.init(context);
            });
        },

        showTopStoriesShowMore: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.collection--small-stories', context).each(function(topStories) {
                    var t = new TopStoriesShowMore(topStories);
                });
            });
        },

        showFaciaPopular: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                faciaPopular.init(config, context);
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.relativiseMastheadDates();
            modules.showTopStoriesShowMore();
            modules.showFaciaPopular();
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
