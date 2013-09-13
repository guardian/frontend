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
    FaciaPopular
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
                var sections = [
                    '.collection--highlights.collection--sport-section',
                    '.collection--highlights.collection--business-section',
                    '.collection--highlights.collection--lifeandstyle-section',
                    '.collection--highlights.collection--technology-section',
                    '.collection--highlights.collection--money-section',
                    '.collection--highlights.collection--travel-section'
                ];
                common.toArray(context.querySelectorAll(sections.join(','))).forEach(function (section) {
                    var f = new FaciaPopular(section);
                    f.render();
                });
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
