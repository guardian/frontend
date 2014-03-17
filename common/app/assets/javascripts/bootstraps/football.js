define([
    'common/$',
    'bonzo',
    'bean',
    'common/utils/context',
    'common/utils/config',
    'common/modules/sport/football/page',
    'common/modules/sport/football/match-list',
    'common/modules/sport/football/match-info',
    'common/modules/sport/football/score-board',
    'common/modules/sport/football/table'
], function (
    $,
    bonzo,
    bean,
    context,
    config,
    page,
    MatchList,
    MatchInfo,
    ScoreBoard,
    Table
) {
    context = context();

    function init() {
        page.isMatch(function(match) {
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

        page.isCompetition(function(competition) {
            var table = new Table(competition),
                tableContainer = bonzo.create('<div class="js-football-table" data-link-name="football-table-embed"></div>');

            $('.js-right-hand-component', context).append(tableContainer);
            table.fetch(tableContainer);
        });

        page.isLiveClockwatch(function() {
            var ml = new MatchList('live', 'premierleague'),
                $img = $('.media-primary'),
                matchListContainer = bonzo.create('<div class="football-match__list" data-link-name="football-matches-clockwatch"></div>');

            loading(matchListContainer, 'Fetching today\'s matches…', { text: 'Impatient?', href: '/football/live' });

            $img.addClass('u-h').after(matchListContainer);
            ml.fetch(matchListContainer).fail(function() {
                $img.removeClass('u-h');
            }).always(function() {
                loaded(matchListContainer);
            });
        });


        // Binding
        bean.on(context, 'click', '.table tr[data-link-to]', function() {
            window.location = this.getAttribute('data-link-to');
        });

        bean.on(context, 'change', $('form.football-leagues')[0], function() {
            window.location = this.value;
        });
    }

    function loading(elem, message, link) {
        bonzo(elem).append(bonzo.create(
            '<div class="loading">'+
                '<div class="loading__message">'+ (message||'Loading…') +'</div>'+
                (link ? '<a href="'+ link.href +'" class="loading__link">'+ link.text +'</a>' : '') +
                '<div class="loading__animation"></div>'+
            '</div>'
        ));
    }

    function loaded(elem) {
        $('.preload-msg', elem).remove();
    }

    return {
        init: init
    };

});
