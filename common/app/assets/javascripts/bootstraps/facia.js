define([
    //Common libraries
    "common",
    //Modules
    "modules/masthead-relative-dates",
    'modules/facia-items-show-more',
    'modules/facia-popular'
], function (
    common,
    mastheadRelativeDates,
    FaciaItemsShowMore,
    FaciaPopular
) {

    var modules = {

        relativiseMastheadDates: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                mastheadRelativeDates.init(context);
            });
        },

        showItemsShowMore: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.js-items--show-more', context).each(function(items) {
                    var t = new FaciaItemsShowMore(items);
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
                common.toArray(context.querySelectorAll(sections.join(','))).forEach(function (collection) {
                    var f = new FaciaPopular(collection);
                    f.render();
                });
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.relativiseMastheadDates();
            modules.showItemsShowMore();
            modules.showFaciaPopular();
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
