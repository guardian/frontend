/*global guardian:false */
define([
    //Common libraries
    "common",
    "qwery",
    "homescreen",
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
    qwery,
    homescreen,
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
        matchNav: function(config){
            if (config.page.footballMatch) {
                var url =  "/football/api/match-nav/" + config.page.footballMatch.id;
                    url += "?currentPage=" + encodeURIComponent(config.page.pageId);
                new MatchNav().load(url);
            }
        },

        initTogglePanels: function () {
            TogglePanel.init();
        },

        showFrontFixtures: function() {
            common.mediator.on('modules:footballfixtures:expand', function(id) {
                var expandable = new Expandable({ id: id, expanded: false });
                expandable.init();
            });
            var table = new FootballFixtures({
                prependTo: qwery('ul > li', '.trailblock')[1],
                contextual: false,
                expandable: true,
                numVisible: 10
            }).init();
        },

        showMoreMatches: function() {
            var matchesNav = document.getElementById('js-matches-nav');
            MoreMatches.init(matchesNav);
        },

        showCompetitionData: function(competition) {
            common.mediator.on('modules:footballfixtures:render', function(){
                var title = document.querySelector('.football-table-link');
                if(title) { title.className = "js-hidden"; }
            });

            var todaysFixtures = new FootballFixtures({
                prependTo: document.querySelector('.t2'),
                competitions: [competition],
                contextual: true,
                expandable: false
            }).init();

            var table = new FootballTable({
                prependTo: document.querySelector('.t3'),
                competition: competition
            }).init();
        },

        showTeamData: function(team) {
            var fixtures = new FootballFixtures({
                prependTo: document.querySelector('.t2'),
                path: '/football/api/teamfixtures/' + team,
                expandable: false
            }).init();

            var table = new FootballTable({
                prependTo: document.querySelector('.t3'),
                path: '/football/api/teamtable/' + team
            }).init();
        },

        initAutoUpdate: function(container, switches) {
            var a = new AutoUpdate({
                path: window.location.pathname,
                delay: 10000,
                attachTo: container,
                switches: switches
            }).init();
        },

        showHomescreen: function() {
            homescreen({
                expire: 1,
                lifespan: 60000,
                returningVisitor: true,
                animationIn: 'fade',
                animationOut: 'fade',
                touchIcon: true,
                message: 'Add this to your %device home screen by tapping on the %icon icon'
            });
        }
    };

    var bindings = function() {
        common.mediator.on('modules:footballfixtures:expand', function(id) {
            var expandable = new Expandable({ id: id, expanded: false });
            expandable.initalise();
        });
    };

    var ready = function(req, config) {

        var page = req.params.action;

        switch(page) {
            case undefined :
                modules.showFrontFixtures();
                break;
            case 'fixtures':
                modules.showMoreMatches();
                modules.initTogglePanels();
                break;
            case 'results':
                modules.showMoreMatches();
                modules.initTogglePanels();
                break;
            case 'live':
                modules.showMoreMatches();
                modules.initTogglePanels();
                if (qwery('.match.live-match').length > 0) {
                    modules.initAutoUpdate(qwery(".matches-container")[0], config.switches);
                }
                break;
            case 'table':
                modules.showMoreMatches();
                modules.initTogglePanels();
                break;
            case 'tables':
                modules.showMoreMatches();
                modules.initTogglePanels();
                break;
            default:
                var comp = config.referenceOfType('paFootballCompetition'),
                    team = config.referenceOfType('paFootballTeam');

                if(comp) {
                    modules.showCompetitionData(comp);
                }
                if(team) {
                    modules.showTeamData(team);
                }
                if(config.page.footballMatch){
                    var match = config.page.footballMatch;

                    modules.matchNav(config);

                    if(match.isLive) {
                        modules.initAutoUpdate(
                            {
                                "summary"   : qwery('.match-summary')[0],
                                "stats"     : qwery('.match-stats')[0]
                            },
                            config.switches,
                            true
                        );
                    }
                }



                break;
        }

        modules.showHomescreen();
    };

    return {
        init: ready
    };

});