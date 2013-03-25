define([
    "common",

    "modules/expandable",
    "modules/autoupdate",
    "modules/matchnav",
    "modules/analytics/reading",
    "modules/story/experiment",
    "modules/accordion",
    "bonzo",
    "bean"
], function (
    common,
    Expandable,
    AutoUpdate,
    MatchNav,
    Reading,
    Experiment,
    Accordion,
    bonzo,
    bean
) {

    var modules = {

        matchNav: function(config){
            var teamIds = config.referencesOfType('paFootballTeam');
            var isRightTypeOfContent = config.hasTone("Match reports") || config.hasTone("Minute by minutes");

            if(teamIds.length === 2 && isRightTypeOfContent){
                var url = "/football/api/match-nav/";
                            url += config.webPublicationDateAsUrlPart() + "/";
                            url += teamIds[0] + "/" + teamIds[1];
                            url += "?currentPage=" + encodeURIComponent(config.page.pageId);
                new MatchNav().load(url);
            }
        },

        initLiveBlogging: function(switches) {
            var a = new AutoUpdate({
                path: window.location.pathname,
                delay: 60000,
                attachTo: document.querySelector(".article-body"),
                switches: switches
            }).init();
        },

        logReading: function(config) {
            var wordCount = config.page.wordCount;
            if(wordCount !== "") {
                
                var reader = new Reading({
                    id: config.page.pageId,
                    wordCount: parseInt(config.page.wordCount, 10),
                    el: document.querySelector('.article-body'),
                    ophanUrl: config.page.ophanUrl
                });

                reader.init();
            }
        },
        
        addOptimizely: function(config) {
            // pull in optimizely js
            if(config.switches.optimizely === true) {
                require(['js!' + config.page.optimizelyUrl]);
            }
        },
            
        abTest: function() {
        	var testName = 'Most Read',
        		updateHrefs = function(selector) { 
        			common.$g(selector).attr('href', function(a) { return bonzo(a).attr('href') + '?testComplete=1' }); 
    			};
    			
	        Abba(testName)
	            .control('Control', function(){
		        	// update hrefs for test
	            	updateHrefs('#tabs-popular-1 a');
	          	})
	            .variant('"The Guardian" selected', function(){
		        	bean.fire(common.$g('#js-popular-tabs a[data-link-name~="Guardian"]')[0], 'click');
	                // update hrefs for test
	            	updateHrefs('#tabs-popular-2 a');
	            })
	            .start();
	        
	        var query = window.location.search; 
	        if(query.indexOf('testComplete=1') !== -1) {
	        	Abba(testName).complete();
	        	// remove test complete flag from query 
	        	// NOTE: causes reload. necessary? better way to do it? 
	        	window.location.search = query.replace('testComplete=1', '');
	        }
        },

        initExperiments: function(config) {
            common.mediator.on('modules:experiment:render', function() {
                if(document.querySelector('.accordion')) {
                    var a = new Accordion();
                }
            });
            var e = new Experiment(config);

            e.init();
        }
    };

    var ready = function(config) {

        modules.initExperiments(config);

        if (config.page.isLive) {
            modules.initLiveBlogging(config.switches);
        }

        if(config.page.section === "football") {
            modules.matchNav(config);
        }

    };

    // If you can wait for load event, do so.
    var defer = function(config) {
        common.deferToLoadEvent(function() {
            modules.logReading(config);
            modules.abTest();
            modules.addOptimizely(config);
        });
    };

    var init = function (req, config) {
        ready(config);
        defer(config);
    };


    return {
        init: init
    };

});

