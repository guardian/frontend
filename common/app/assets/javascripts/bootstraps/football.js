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
            var prependTo,
                table,
                attachMethod;
            if (common.$g('.facia-container').length) {
                // wrap the return sports stats component in an 'item'
                prependTo = bonzo(bonzo.create('<li class="item item--sport-stats"></li>')),
                    attachMethod = 'append';
                common.mediator.on('modules:footballfixtures:render', function() {
                    var container = common.$g('.collection--news', context)
                        .first()[0];
                    // toggle class
                    common.$g('.items', container)
                        .first()
                        .removeClass('items--without-sport-stats')
                        .addClass('items--with-sport-stats');
                    // add it after the first item
                    common.$g('.item:first-child', container)
                        .first()
                        .after(prependTo);
                });
            } else {
                prependTo = context.querySelector('.trailblock ul > li'),
                    attachMethod = 'after';
            }

            if(!bonzo(prependTo).hasClass('footballfixtures-loaded')) {
                bonzo(prependTo).addClass('footballfixtures-loaded');
                table = new FootballFixtures({
                    prependTo: prependTo,
                    attachMethod: attachMethod,
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
                path: '/football/api/teamfixtures/' + team + '.json',
                expandable: false
            }).init();

            var table = new FootballTable({
                prependTo: context.querySelector('.t3'),
                path: '/football/api/teamtable/' + team + '.json'
            }).init();
        },

        initAutoUpdate: function(container, switches, responseSelector) {
            var a = new AutoUpdate({
                path: window.location.pathname,
                delay: 10000,
                attachTo: container,
                switches: switches,
                responseSelector: responseSelector,
                progressToggle: true,
                progressColour: '#70d2e6'
            }).init();
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

    };

    return {
        init: ready
    };

});
