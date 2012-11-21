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

        showCompetitionData: function(competition) {
            common.mediator.on('modules:footballfixtures:render', function(){
                var title = document.querySelector('.football-table-link');
                if(title) { title.className = "js-hidden"; }
            });

            var fixtures = new FootballFixtures({
                prependTo: document.querySelector('.t2'),
                competitions: [competition],
                expandable: false
            }).init();

            var table = new FootballTable({
                prependTo: document.querySelector('.t3'),
                competition: competition
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
                    modules.showCompetitionData(comp);
                }
                break;
        }
    };

    return {
        init: ready
    };

});