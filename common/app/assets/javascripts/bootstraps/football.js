define([
    'common/$',
    'bonzo',
    'bean',
    'common/utils/context',
    'common/utils/config',
    'common/modules/sport/football/match-info',
    'common/modules/sport/football/score-board',
    'common/modules/sport/football/table'
], function (
    $,
    bonzo,
    bean,
    context,
    config,
    MatchInfo,
    ScoreBoard,
    Table
) {
    context = context();

    function isAMatchPage(yes) {
        var teams = config.referencesOfType('paFootballTeam'),
            footballMatch = config.page.footballMatch;

        if (footballMatch ||
            ((config.hasTone("Match reports") || config.page.isLiveBlog) && teams.length === 2)) {
            return yes(footballMatch || {
                date: config.webPublicationDateAsUrlPart(),
                teams: teams
            });
        }
    }

    function isACompetitionPage(yes) {
        var competition = ($('.js-football-competition').attr('data-link-name') || '').replace('keyword: ', '');
        if (competition) {
            return yes(competition);
        }
    }

    function init() {
        isAMatchPage(function(match) {
            var $h = $('.article__headline', context),
                matchInfo = new MatchInfo(match, config.page.pageId),
                scoreBoard = new ScoreBoard(),
                scoreContainer = bonzo.create(
                    '<div class="score__container">'+
                        '<div class="score__loading'+ (config.page.isLiveBlog ? ' score__loading--live':'') +'">'+
                            '<div class="loading__text">Fetching the scores…</div>'+
                            '<div class="is-updating"></div>'+
                        '</div>'+
                    '</div>')[0];

            $h.before(scoreContainer);
            if (config.page.isLiveBlog){
                $h.addClass('u-h');
            }

            matchInfo.fetch().then(function(resp) {
                $('.after-header', context).append(resp.nav);
                scoreBoard.template = config.page.isLiveBlog ? resp.matchSummary : resp.scoreSummary;
                scoreContainer.innerHTML = '';
                scoreBoard.render(scoreContainer);
            });
        });

        isACompetitionPage(function(competition) {
            var table = new Table(competition),
                tableEl = bonzo.create('<div class="js-football-table" data-link-name="football-table-embed"></div>');

            $('.js-right-hand-component', context).append(tableEl);
            table.fetch(tableEl);
        });


        // Binding
        var trs = $('.table tr[data-link-to]').css({ 'cursor': 'pointer' }).map(function(elem) { return elem; });
        bean.on(context, 'click', trs, function(e) {
            window.location = this.getAttribute('data-link-to');
        });

        bean.on(context, 'change', $('form.football-leagues')[0], function() {
            window.location = this.value +'/'+ this.form.pageType.value;
        });
    }

    return {
        isAMatchPage: isAMatchPage,
        isACompetition: isACompetitionPage,
        init: init
    };

});
