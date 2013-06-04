/*global guardian:false */
define([
    //Common libraries
    "common",
    "bonzo",
    //Modules
    "modules/router",
    "modules/togglepanel",
    "modules/expandable",
    "modules/footballfixtures",
    "modules/footballtables",
    "modules/more-matches",
    "modules/autoupdate",
    "modules/pad",
    "modules/matchnav"
], function (
    common,
    bonzo,
    Router,
    TogglePanel,
    Expandable,
    FootballFixtures,
    FootballTable,
    MoreMatches,
    AutoUpdate,
    Pad,
    MatchNav
) {

    var modules = {
        matchNav: function(config, context){
            if (config.page.footballMatch) {
                var url =  "/football/api/match-nav/" + config.page.footballMatch.id;
                    url += "?currentPage=" + encodeURIComponent(config.page.pageId);
                new MatchNav().load(url, context);
            }
        },

        showFrontFixtures: function(context) {
            var prependTo = context.querySelector('.trailblock ul > li'),
                table;
            if(!bonzo(prependTo).hasClass('footballfixtures-loaded')) {
                bonzo(prependTo).addClass('footballfixtures-loaded');
                table = new FootballFixtures({
                    prependTo: prependTo,
                    contextual: false,
                    expandable: true,
                    numVisible: 10
                }).init();
            }
        },

        showMoreMatches: function(context) {
            MoreMatches.init(context.querySelector('.js-matches-nav'));
            TogglePanel.init(context);
        },

        showCompetitionData: function(competition, context) {
            common.mediator.on('modules:footballfixtures:render', function(){
                var title = context.querySelector('.football-table-link');
                if(title) { title.className = "js-hidden"; }
            });

            var todaysFixtures = new FootballFixtures({
                prependTo: context.querySelector('.t2'),
                competitions: [competition],
                contextual: true,
                expandable: false
            }).init();

            var table = new FootballTable({
                prependTo: context.querySelector('.t3'),
                competition: competition
            }).init();
        },

        showTeamData: function(team, context) {
            var fixtures = new FootballFixtures({
                prependTo: context.querySelector('.t2'),
                path: '/football/api/teamfixtures/' + team,
                expandable: false
            }).init();

            var table = new FootballTable({
                prependTo: context.querySelector('.t3'),
                path: '/football/api/teamtable/' + team
            }).init();
        },

        initAutoUpdate: function(container, switches, responseSelector) {
            var a = new AutoUpdate({
                path: window.location.pathname,
                delay: 10000,
                attachTo: container,
                switches: switches,
                responseSelector: responseSelector
            }).init();
        },

        showHomescreen: function(config) {
            if (config.switches.homescreen) {
                require(['homescreen'], function(homescreen){
                    homescreen({
                        expire: 60, // minutes until the popup is offered again (unless they've clicked on Close)
                        returningVisitor: true, // Offer it only on a return visit
                        animationIn: 'fade',
                        animationOut: 'fade',
                        touchIcon: true,
                        message: 'Add this to your %device by tapping %icon then <strong>Add to Home Screen</strong>'
                    });
                });
            }
        }
    };

    var bindings = function() {
        common.mediator.on('modules:footballfixtures:expand', function(id) {
            var expandable = new Expandable({ id: id, expanded: false });
            expandable.initalise();
        });
    };

    var ready = function(req, config, context) {
        common.lazyLoadCss('football', config);

        var page = req.params.action;

        switch(page) {
            case undefined :
                modules.showFrontFixtures(context);
                break;
            case 'live':
                modules.showMoreMatches(context);
                if (context.querySelector('.match.live-match')) {
                    modules.initAutoUpdate(context.querySelector('.matches-container'), config.switches, '.matches-container > *');
                }
                break;
            case 'fixtures':
                modules.showMoreMatches(context);
                break;
            case 'results':
                modules.showMoreMatches(context);
                break;
            case 'table':
                modules.showMoreMatches(context);
                break;
            case 'tables':
                modules.showMoreMatches(context);
                break;
            default:
                var comp = config.referenceOfType('paFootballCompetition'),
                    team = config.referenceOfType('paFootballTeam');

                if(comp) {
                    modules.showCompetitionData(comp, context);
                }
                if(team) {
                    modules.showTeamData(team, context);
                }
                if(config.page.footballMatch){
                    var match = config.page.footballMatch;

                    modules.matchNav(config, context);

                    if(match.isLive) {
                        modules.initAutoUpdate(
                            {
                                "summary"   : context.querySelector('.match-summary'),
                                "stats"     : context.querySelector('.match-stats')
                            },
                            config.switches,
                            {
                                "summary"   : '.match-summary > *',
                                "stats"     : '.match-stats > *'
                            }
                        );
                    }
                }
                break;
        }
    
        modules.showHomescreen(config);
    };

    return {
        init: ready
    };

});