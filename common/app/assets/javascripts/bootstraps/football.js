/*global guardian:false */
define([
    //Common libraries
    'common/$',
    'common/utils/config',
    'common/utils/context',
    'common/utils/mediator',
    'common/utils/lazy-load-css',
    'bonzo',

    //Modules
    'common/modules/ui/togglepanel',
    'common/modules/ui/expandable',
    'common/modules/sport/football/fixtures',
    'common/modules/sport/football/tables',
    'common/modules/sport/football/more-matches',
    'common/modules/ui/autoupdate',
    'common/modules/sport/football/matchnav'
], function (
    $,
    config,
    context,
    mediator,
    lazyLoadCss,
    bonzo,
    TogglePanel,
    Expandable,
    FootballFixtures,
    FootballTable,
    MoreMatches,
    AutoUpdate,
    MatchNav
) {
    context = context();
    var modules = {
        matchNav: function(){
            if (config.page.footballMatch) {
                var url =  "/football/api/match-nav/" + config.page.footballMatch.id;
                    url += ".json?page=" + encodeURIComponent(config.page.pageId);
                new MatchNav().load(url, context);
            }
        },

        showFrontFixtures: function() {
            // wrap the return sports stats component in an 'item'
            var prependTo = bonzo.create('<div class="fromage tone-accent-border tone-news unstyled"></div>');
            mediator.on('modules:footballfixtures:render', function() {
                bonzo($('.collection-wrapper', context).get(1))
                    .append(prependTo);
            });
            new FootballFixtures({
                prependTo: prependTo,
                attachMethod: 'append',
                contextual: false,
                expandable: false,
                numVisible: 10
            }).init();
        },

        showMoreMatches: function() {
            MoreMatches.init(context.querySelector('.js-matches-nav'));
            TogglePanel.init(context);
        },

        showCompetitionData: function(competition) {
            // wrap the return sports stats component in an 'item'
            var fixtures = bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>'),
                table = bonzo.create('<li class="item item--sport-stats item--sport-table"></li>');
            mediator.on('modules:footballfixtures:render', function() {
                var $collection = $('.container--sport .collection', context);
                $('.item:first-child', $collection[0])
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

        showTeamData: function(team) {
            // wrap the return sports stats component in an 'item'
            var fixtures = bonzo.create('<div></div>'),
                table = bonzo.create('<li class="item item--sport-stats item--sport-table"></li>');
            mediator.on('modules:footballfixtures:render', function() {
                var $collection = $('.container--sport .collection', context),
                    $thirdItem = $('.item:nth-child(3)', $collection[0]);
                // pull fixtures out into two items
                bonzo(bonzo.create('<li class="item item--sport-stats"></li>'))
                    .append($('.team-fixtures, a:nth-child(2)', fixtures))
                    .insertAfter($thirdItem);
                bonzo(bonzo.create('<li class="item item--sport-stats"></li>'))
                    .append($('.team-results, a:nth-child(4)', fixtures))
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
        mediator.on('modules:footballfixtures:expand', function(id) {
            var expandable = new Expandable({ id: id, expanded: false });
            expandable.initalise();
        });
    };

    var ready = function() {
        var action = window.location.pathname.split('/')[2]; // removing router for now
        lazyLoadCss('football', config);

        switch(action) {
            case 'fixtures':
            case 'results':
            case 'table':
            case 'tables':
                modules.showMoreMatches();
                break;

            case undefined:
                modules.showFrontFixtures();
                break;

            case 'live':
                modules.showMoreMatches();
                if (context.querySelector('.match.live-match')) {
                    modules.initAutoUpdate(context.querySelector('.matches-container'), config.switches, '.matches-container > *');
                }
                break;

            default:
                if(config.page.contentType === 'Article') { return false; } //Prevent loading of fixtures in story packages

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
