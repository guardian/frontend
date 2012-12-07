/*global guardian:false */
define([
    //Common libraries
    "common",
    "qwery",
    //Modules
    "modules/router",
    "modules/togglepanel",
    "modules/expandable",
    "modules/footballfixtures",
    "modules/footballtables",
    "modules/more-matches",
    "modules/autoupdate"
], function (
    common,
    qwery,

    Router,
    TogglePanel,
    Expandable,
    FootballFixtures,
    FootballTable,
    MoreMatches,
    AutoUpdate
) {

    var modules = {

        related: function(config){

            // thank you http://www.electrictoolbox.com/pad-number-zeroes-javascript/
            function pad(number, length) {
                var str = '' + number;
                while (str.length < length) {
                    str = '0' + str;
                }
                return str;
            }

            var match = guardian.footballMatch;
            var date = match.date;

            var url = '/football/api/more-on-match/'
                + date.getFullYear() + '/'
                + pad(date.getMonth() + 1, 2) + '/'
                + pad(date.getDate(), 2) + '/'
                + match.homeTeam + '/'
                + match.awayTeam;

            common.mediator.emit("modules:related:load", [url]);
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

            var fixtures = new FootballFixtures({
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

        initAutoUpdate: function(switches) {
            if (qwery('.match.live-match').length > 0) {
                var a = new AutoUpdate({
                    path: window.location.pathname,
                    delay: 10000,
                    attachTo: qwery(".matches-container")[0],
                    switches: switches
                }).init();
            }
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
                modules.initAutoUpdate(config.switches);
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
                var comp = config.page.paFootballCompetition,
                    team = config.page.paFootballTeam;

                if(comp) {
                    modules.showCompetitionData(comp);
                }
                if(team) {
                    modules.showTeamData(team);
                }
                if(guardian.footballMatch){
                    modules.related(config);
                }

                break;
        }
    };

    return {
        init: ready
    };

});