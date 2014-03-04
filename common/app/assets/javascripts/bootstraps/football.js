/*global guardian:false */
define([
    //Common libraries
    'common/$',
    'common/utils/config',
    'common/utils/context',
    'common/utils/mediator',
    'common/utils/lazy-load-css',
    'bonzo',
    'qwery',
    'bean',

    //Modules
    'common/modules/ui/togglepanel',
    'common/modules/ui/expandable',
    'common/modules/sport/football/fixtures',
    'common/modules/sport/football/tables',
    'common/modules/sport/football/more-matches',
    'common/modules/ui/autoupdate',
    'common/modules/sport/football/matchnav',
    'common/modules/sport/football/table'
], function (
    $,
    config,
    context,
    mediator,
    lazyLoadCss,
    bonzo,
    qwery,
    bean,
    TogglePanel,
    Expandable,
    FootballFixtures,
    FootballTable,
    MoreMatches,
    AutoUpdate,
    MatchNav,
    Table
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
            var prependTo = bonzo.create('<div class="fromage tone-accent-border tone-news unstyled item--sport-stats"></div>');
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
            var fixtures = bonzo.create('<div class="fromage tone-accent-border tone-news unstyled item--sport-stats"></div>'),
                table = bonzo.create('<div class="fromage tone-accent-border tone-news unstyled item--sport-stats"></div>');
            mediator.on('modules:footballfixtures:render', function() {
                bonzo($('.collection-wrapper', context).get(1))
                    .append(fixtures)
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
        var bits = window.location.pathname.split('/'),
            action = config.page.contentType === 'Article' ? 'article' : (bits.length === 3 ? bits[2] : bits[3]); // removing router for now
        // lazyLoadCss('football', config);

        // not worth over complicating for the time being
        var trs = $('.table tr[data-link-to]').css({ 'cursor': 'pointer' }).map(function(elem) { return elem; });
        bean.on(context, 'click', trs, function(e) {
            window.location = this.getAttribute('data-link-to');
        });

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

            case 'article':
                var competition = ($('.js-football-competition').attr('data-link-name') || '').replace('keyword: ', '');

                if (competition) {
                    var table = new Table(competition),
                        tableEl = bonzo.create('<div class="js-football-table" data-link-name="football-table-embed"></div>');

                    $('.js-right-hand-component').append(tableEl);
                    table.fetch(tableEl).then(function() {
                        mediator.emit('bootstrap:football:rhs:table:ready');
                    });
                }

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
