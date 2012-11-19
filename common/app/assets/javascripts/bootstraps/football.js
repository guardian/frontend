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

        initTogglePanels: function () {
            TogglePanel.init();
        },

        showFrontFixtures: function() {
            var table = new FootballFixtures({
                    prependTo: qwery('ul > li', '.trailblock')[1],
                    expandable: false
            }).init();
        },

        showMoreMatches: function() {
            var matchesNav = document.getElementById('js-matches-nav');
            MoreMatches.init(matchesNav);
        },

        showCompetitionFixtures: function(competition) {
            var fixtures = new FootballFixtures({
                    prependTo: qwery('ul > li', '.trailblock')[1],
                    competitions: [competition],
                    expandable: false
                }).init();
        },

        showCompetitionTable: function(comp) {
            var table = new FootballTable({
                prependTo: qwery('ul > li', '.trailblock')[1],
                competition: comp
            }).init();
        },

        initAutoUpdate: function(switches) {
            if (qwery('.match.live-match').length) {
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
                var comp = config.page.paFootballCompetition;
                if(comp) {
                    modules.showCompetitionFixtures(comp);
                    modules.showCompetitionTable(comp);
                }
                break;
        }
    };

    return {
        init: ready
    };

});