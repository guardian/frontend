/*global guardian:false */
define([
    //Common libraries
    "common",
    "bonzo",
    //Modules
    "modules/router",
    "modules/togglepanel",
    "modules/expandable",
    "modules/sport/football/fixtures",
    "modules/sport/football/tables",
    "modules/sport/football/more-matches",
    "modules/autoupdate",
    "modules/sport/football/matchnav"
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
    MatchNav
) {

    var modules = {
        matchNav: function(config, context){
            if (config.page.footballMatch) {
                var url =  "/football/api/match-nav/" + config.page.footballMatch.id;
                    url += ".json?page=" + encodeURIComponent(config.page.pageId);
                new MatchNav().load(url, context);
            }
        },

        showFrontFixtures: function(context) {
            // wrap the return sports stats component in an 'item'
            var prependTo = bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>');
            common.mediator.on('modules:footballfixtures:render', function() {
                var $collection = common.$g('.container--news .collection', context);
                common.$g('.item:first-child', $collection[0])
                    .after(prependTo);
                $collection.removeClass('collection--without-sport-stats')
                    .addClass('collection--with-sport-stats');
            });
            new FootballFixtures({
                prependTo: prependTo,
                attachMethod: 'append',
                contextual: false,
                expandable: false,
                numVisible: 10
            }).init();
        },

        showMoreMatches: function(context) {
            MoreMatches.init(context.querySelector('.js-matches-nav'));
            TogglePanel.init(context);
        },

        showCompetitionData: function(competition, context) {
            // wrap the return sports stats component in an 'item'
            var fixtures = bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>'),
                table = bonzo.create('<li class="item item--sport-stats item--sport-table"></li>');
            common.mediator.on('modules:footballfixtures:render', function() {
                var $collection = common.$g('.container--news .collection', context);
                common.$g('.item:first-child', $collection[0])
                    .after(fixtures);
                $collection.removeClass('collection--without-sport-stats')
                    .addClass('collection--with-sport-stats')
                    .append(table);
            });
            new FootballFixtures({
                prependTo: fixtures,
                attachMethod: 'append',
                competitions: [competition],
                contextual: true,
                expandable: false
            }).init();
            new FootballTable({
                prependTo: table,
                attachMethod: 'append',
                competition: competition
            }).init();
        },

        showTeamData: function(team, context) {
            // wrap the return sports stats component in an 'item'
            var fixtures = bonzo.create('<div></div>'),
                table = bonzo.create('<li class="item item--sport-stats item--sport-table"></li>');
            common.mediator.on('modules:footballfixtures:render', function() {
                var $collection = common.$g('.container--news .collection', context),
                    $thirdItem = common.$g('.item:nth-child(3)', $collection[0]);
                // pull fixtures out into two items
                bonzo(bonzo.create('<li class="item item--sport-stats"></li>'))
                    .append(common.$g('.team-fixtures, a:nth-child(2)', fixtures))
                    .insertAfter($thirdItem);
                bonzo(bonzo.create('<li class="item item--sport-stats"></li>'))
                    .append(common.$g('.team-results, a:nth-child(4)', fixtures))
                    .insertAfter($thirdItem);
                $collection.append(table);
            });
            new FootballFixtures({
                prependTo: fixtures,
                attachMethod: 'append',
                path: '/football/api/teamfixtures/' + team + '.json',
                expandable: false
            }).init();
            new FootballTable({
                prependTo: table,
                attachMethod: 'append',
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
