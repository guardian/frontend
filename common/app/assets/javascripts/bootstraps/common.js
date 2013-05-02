define([
    //Commmon libraries
    'common',
    'ajax',
    'modules/userPrefs',
    //Vendor libraries
    'domReady',
    'bonzo',
    //Modules
    'modules/pageconfig',
    'modules/popular',
    'modules/related',
    'modules/router',
    'modules/images',
    'modules/navigation/top-stories',
    'modules/navigation/sections',
    'modules/navigation/search',
    'modules/navigation/control',
    'modules/tabs',
    'modules/relativedates',
    'modules/analytics/clickstream',
    'modules/analytics/omniture',
    'modules/analytics/optimizely',
    'modules/adverts/adverts',
    'modules/cookies',
    'modules/analytics/omnitureMedia',
    'modules/debug',
    'modules/experiments/ab',
    'modules/swipenav'
], function (
    common,
    ajax,
    userPrefs,

    domReady,
    bonzo,

    pageConfig,
    popular,
    related,
    Router,
    Images,
    TopStories,
    Sections,
    Search,
    NavControl,
    Tabs,
    RelativeDates,
    Clickstream,
    Omniture,
    optimizely,
    Adverts,
    Cookies,
    Video,
    Debug,
    AB,
    swipeNav
) {

    var modules = {

        upgradeImages: function () {
            var images = new Images();
            common.mediator.on('page:common:ready', function(config, context) {
                images.upgrade(context);
            });
            common.mediator.on('fragment:ready:images', function(context) {
                images.upgrade(context);
            });
        },

        initialiseNavigation: function (config) {
            var navControl = new NavControl();
            var sections = new Sections();
            var search = new Search(config);
            common.mediator.on('page:common:ready', function(config, context) {
                navControl.init(context);
                sections.init(context);
                search.init(context);
            });
        },

        transcludeTopStories: function () {
            var topStories = new TopStories();
            common.mediator.on('page:common:ready', function(config, context) {
                topStories.load(config, context);
            });
        },

        transcludeRelated: function () {
            common.mediator.on("page:common:ready", function(config, context){
                related(config, context);
            });
        },

        transcludePopular: function () {
            common.mediator.on('page:common:ready', function(config, context) {
                popular(config, context);
            });
        },

        showTabs: function() {
            var tabs = new Tabs();
            common.mediator.on('modules:popular:loaded', function(el) {
                tabs.init(el);
            });
        },

        showRelativeDates: function () {
            var dates = RelativeDates;
            common.mediator.on('page:common:ready', function(config, context) {
                dates.init(context);
            });
            common.mediator.on('fragment:ready:dates', function(el) {
                dates.init(el);
            });
        },

        loadAnalytics: function () {
            var cs = new Clickstream({filter: ["a", "button"]}),
                omniture = new Omniture();

            common.mediator.on('page:common:deferred:loaded', function(config, context) {

                // AB must execute before Omniture
                AB.init(config);

                omniture.go(config, function(){
                    // callback:

                    Array.prototype.forEach.call(context.getElementsByTagName("video"), function(video){
                        if (!bonzo(video).hasClass('tracking-applied')) {
                            bonzo(video).addClass('tracking-applied');
                            var v = new Video({
                                el: video,
                                config: config
                            }).init();
                        }
                    });
                });

                require(config.page.ophanUrl, function (Ophan) {
                    if(AB.inTest(config.switches)) {
                        Ophan.additionalViewData(function() {
                            var test = AB.getTest(),
                                data = [
                                    {
                                        id: test.id,
                                        variant: test.variant
                                    }
                                ];
                            return {
                                "experiments_json": JSON.stringify(data)
                            };
                        });
                    }
                    Ophan.startLog(config.referrer);
                });

            });
        },

        loadAdverts: function () {
            if (!userPrefs.isOff('adverts')){
                common.mediator.on('page:common:deferred:loaded', function(config, context) {
                    if (config.switches && config.switches.adverts) {
                        Adverts.init(config, context);
                        common.mediator.on('modules:adverts:docwrite:loaded', Adverts.loadAds);
                    }
                });
            }
        },

        cleanupCookies: function() {
            Cookies.cleanUp(["mmcore.pd", "mmcore.srv", "mmid"]);
        },

        showSharedWisdomToolbar: function(config) {
            // only display if switched on
            if (userPrefs.isOn('shared-wisdom-toolbar')) {
                require('modules/shared-wisdom-toolbar', function(sharedWisdomToolbar) {
                    sharedWisdomToolbar.init(function() {
                        sharedWisdomToolbar.show();
                    }, config.modules.sharedWisdomToolbar);
                });
            }
        },

        getSwipeSequence: function(callback) {
            ajax({
                url: '/more-stories' + window.location.pathname,
                type: 'jsonp',
                success: function (json) {
                    if (json.stories && json.stories.length >= 3) {
                        callback(json.stories);
                    }
                }
            });
        },

        startSwipe: function(sequence) {
            var
                linkSelector = '',
                //linkSelector = 'a:not(.control)',
                opts,
                pages = document.querySelector('#swipepages'),
                page0 = pages.querySelector('#swipepage-0 .parts'),
                page1 = pages.querySelector('#swipepage-1 .parts'),
                page2 = pages.querySelector('#swipepage-2 .parts'),
                head  = page1.querySelector('.parts__head'),
                foot  = page1.querySelector('.parts__foot'),
                initialBodyHtml = '<div class="parts__body"><div class="swipepage-msg">Loading page...</div></div>';

            bonzo(page0).append(head.cloneNode(true));
            bonzo(page0).append(bonzo.create(initialBodyHtml));
            bonzo(page0).append(foot.cloneNode(true));

            bonzo(page2).append(head.cloneNode(true));
            bonzo(page2).append(bonzo.create(initialBodyHtml));
            bonzo(page2).append(foot.cloneNode(true));

            opts = {
                afterShow: function(config) {
                    var swipe = config.swipe;

                    if( swipe.initiatedBy !== 'initial') {
                        common.mediator.emit('page:ready', pageConfig(config), swipe.visiblePane);
                    }

                    if(linkSelector && swipe.initiatedBy === 'link') {
                        modules.getSwipeSequence(function(sequence){
                            swipe.api.setSequence(sequence);
                            swipe.api.loadSidePanes();
                        });
                    } else {
                        swipe.api.loadSidePanes();
                    }
                },
                linkSelector: linkSelector,
                swipeContainer: '#swipepages',
                contentSelector: '.parts__body',
                sequence: sequence
            };
            swipeNav(opts);
        }
    };

    var deferrable = function (config, context) {
        var self = this;
        common.deferToLoadEvent(function() {
            if (!self.initialisedDeferred) {
                self.initialisedDeferred = true;
                modules.loadAdverts();
                modules.loadAnalytics();

                // TODO: make these run in event 'page:common:deferred:loaded'
                modules.cleanupCookies(context);
                modules.showSharedWisdomToolbar(config);
            }
            common.mediator.emit("page:common:deferred:loaded", config, context);
        });
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.upgradeImages();
            modules.showTabs();
            modules.showRelativeDates();
            modules.transcludeRelated();
            modules.transcludePopular();
            modules.transcludeTopStories();
            modules.initialiseNavigation(config);
            modules.getSwipeSequence(modules.startSwipe);
        }
        common.mediator.emit("page:common:ready", config, context);
    };

    var init = function (config, context) {
        ready(config, context);
        deferrable(config, context);
    };

    return {
        init: init
    };
});
