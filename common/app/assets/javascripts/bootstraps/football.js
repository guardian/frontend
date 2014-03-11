define([
    'common/$',
    'bonzo',
    'common/utils/context',
    'common/utils/config',
    'common/modules/sport/football/match-info',
    'common/modules/sport/football/score-board'
], function (
    $,
    bonzo,
    context,
    config,
    MatchInfo,
    ScoreBoard
) {
    context = context();

    function isAMatch(yes) {
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

    function ready() {
        isAMatch(function(match) {
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

        /*var trs = $('.table tr[data-link-to]').css({ 'cursor': 'pointer' }).map(function(elem) { return elem; });
        bean.on(context, 'click', trs, function(e) {
            window.location = this.getAttribute('data-link-to');
        });*/
    }



    return {
        isAMatch: isAMatch,
        init: ready
    };

});
