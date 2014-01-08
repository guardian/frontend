define([
    // Common libraries
    'common/$',
    'common/utils/mediator',
    'bonzo',
    'qwery',
    // Modules
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/to-array',
    'common/modules/facia/popular',
    'common/modules/facia/collection-show-more',
    'common/modules/facia/container-toggle',
    'common/modules/sport/football/fixtures',
    'common/modules/sport/cricket',
    'common/modules/ui/message'
], function (
    $,
    mediator,
    bonzo,
    qwery,
    detect,
    storage,
    toArray,
    popular,
    CollectionShowMore,
    ContainerToggle,
    FootballFixtures,
    cricket,
    Message
    ) {

    var modules = {

        showCollectionShowMore: function () {
            mediator.on('page:front:ready', function(config, context) {
                $('.container', context).each(function(container) {
                    $('.js-collection--show-more', container).each(function(collection) {
                        new CollectionShowMore(collection).addShowMore();
                    });
                });
            });
        },

        showContainerToggle: function () {
            mediator.on('page:front:ready', function(config, context) {
                $('.js-container--toggle', context).each(function(container) {
                    new ContainerToggle(container).addToggle();
                });
            });
        },

        showFootballFixtures: function(path) {
            mediator.on('page:front:ready', function(config, context) {
                if (config.page.edition === 'UK' && (config.page.pageId === "" || config.page.pageId === "sport")) {
                    // wrap the return sports stats component in an 'item'
                    var prependTo = bonzo(bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>'));
                    mediator.on('modules:footballfixtures:render', function() {
                        var $container = $('.container--sport', context).first();
                        if ($container[0]) {
                            var $collection = $('.collection', $container[0]);
                            $('.item:first-child', $collection[0])
                                // add empty item
                                .after(prependTo);
                            $collection.removeClass('collection--without-sport-stats')
                                .addClass('collection--with-sport-stats');
                        }
                    });
                    new FootballFixtures({
                        prependTo: prependTo,
                        attachMethod: 'append',
                        competitions: ['500', '510', '100', '400'],
                        contextual: false,
                        expandable: true,
                        numVisible: config.page.pageId === "" ? 3 : 5
                    }).init();
                }
            });
        },

        showPopular: function () {
            mediator.on('page:front:ready', function(config, context) {
                var opts = {};
                // put popular after the first container if this is us-alpha front
                if (config.page.pageId === 'us-alpha') {
                    opts.insertAfter = $('.container').first();
                } else if (config.page.pageId === 'uk-alpha') {
                    // place before the contributors container
                    var containers = toArray(context.getElementsByClassName('container'));
                    containers.some(function(container, i) {
                        if ($(container).hasClass('container--comment')) {
                            opts.insertAfter = containers[i -1];
                            return true;
                        }
                    });

                }
                popular.render(config, opts);
            });
        },

        showCricket: function(){
            mediator.on('page:front:ready', function(config, context) {
                cricket.cricketTrail(config, context);
            });
        },

        showUserzoom: function(config) {
            var path,
                steps;

            if (config.switches.userzoom && config.switches.faciaUkAlpha) {
                path = window.location.pathname.substring(1);

                if (path !== 'uk' && path !=='uk-alpha') { return; }

                steps = [
                    {
                        pageId: 'uk-alpha',
                        visits: 0,
                        script: 'userzoom-uk-alpha'
                    },
                    {
                        pageId: '',
                        visits: 2,
                        script: 'userzoom-uk'
                    }
                ];

                mediator.on('page:front:ready', function(config, context) {
                    steps.some(function(step) {
                        var storeKey,
                            visits;

                        if (step.pageId === config.page.pageId) {
                            storeKey = 'gu.userzoom.uk.' + step.pageId;
                            visits = parseInt(storage.local.get(storeKey) || 0, 10);
                            if(visits >= step.visits) {
                                require(['js!' + step.script]);
                            } else {
                                storage.local.set(storeKey, visits + 1);
                            }
                            return true;
                        }
                    });
                });
            }
        },

        displayAlphaMessage: function(config) {
            if (config.page.contentType === 'Network Front') {
                var page = window.location.pathname,
                    msg = '<p class="site-message__message">' +
                              'Test the <a href="/preference' + page + 'alpha/optin?page=' + page + '">alpha fronts</a>' +
                          '</p>';
                new Message('facia-alpha').show(msg);
            }
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showCollectionShowMore();
            modules.showContainerToggle();
            modules.showFootballFixtures();
            modules.showPopular();
            modules.showUserzoom(config);
            modules.displayAlphaMessage(config);
        }
        mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
