define([
    'common/$',
    'bonzo',
    'bean',
    'common/utils/context',
    'common/utils/config',
    'common/utils/page',
    'common/modules/ui/rhc',
    'common/modules/sport/football/match-list',
    'common/modules/sport/football/match-info',
    'common/modules/sport/football/match-stats',
    'common/modules/sport/football/score-board',
    'common/modules/sport/football/table'
], function (
    $,
    bonzo,
    bean,
    context,
    config,
    page,
    rhc,
    MatchList,
    MatchInfo,
    MatchStats,
    ScoreBoard,
    Table
) {
    context = context();

    function init() {
        var $article = $('.js-article__container', context);

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
                var $nav = $.create(resp.nav).first().each(function(nav) {
                    if (match.id || $('.tabs__tab', nav).length > 2) {
                        $('.after-header', context).append(nav);
                    }
                });

                if (!match.id) {
                    scoreContainer.innerHTML = '';
                    scoreBoard.template = config.page.isLiveBlog ? resp.matchSummary : resp.scoreSummary;

                    if(!/^\s+$/.test(scoreBoard.template)) {
                        scoreBoard.render(scoreContainer);
                    }

                    $('.tab--min-by-min a', $nav).first().each(function(el) {
                        bonzo(scoreBoard.elem).addClass('u-fauxlink');
                        bean.on(scoreBoard.elem, 'click', function() {
                            window.location = el.getAttribute('href');
                        });
                    });

                    var statsUrl = $('.tab--stats a', $nav).attr('href').replace(/^.*\/\/[^\/]+/, ''),
                        statsContainer = bonzo.create('<div class="match-stats__container"></div>'),
                        matchStats = new MatchStats(statsUrl);

                    page.rightHandComponentVisible(function() {
                        rhc.addComponent(statsContainer, 3);
                    }, function() {
                        $article.append(statsContainer);
                    });
                    matchStats.fetch(statsContainer);
                }
            });
        });

        page.isCompetition(function(competition) {
            var table = new Table(competition),
                tableContainer = bonzo.create('<div class="js-football-table" data-link-name="football-table-embed"></div>');

            page.rightHandComponentVisible(function() {
                rhc.addComponent(tableContainer, 2);
                table.fetch(tableContainer);
            });
        });

        page.isLiveClockwatch(function() {
            var ml = new MatchList('live', 'premierleague'),
                $img = $('.media-primary'),
                $matchListContainer = $.create('<div class="football-matches__container" data-link-name="football-matches-clockwatch"></div>')
                                          .css({ minHeight: $img[0] ? $img[0].offsetHeight : 0 });

            $img.addClass('u-h');
            loading($matchListContainer[0], 'Fetching today\'s matches…', { text: 'Impatient?', href: '/football/live' });

            $('.article__meta-container').before($matchListContainer);
            ml.fetch($matchListContainer[0]).fail(function() {
                ml.destroy();
                $matchListContainer.remove();
                $img.removeClass('u-h');
            }).always(function() {
                if ($('.football-match', $matchListContainer[0]).length === 0) {
                    ml.destroy();
                    $matchListContainer.remove();
                    $img.removeClass('u-h');
                }
                $matchListContainer.css({ minHeight: 0 });
                loaded($matchListContainer[0]);
            });
        });

        // Binding
        bean.on(context, 'click', '.table tr[data-link-to]', function(e) {
            if (!e.target.getAttribute('href')) {
                window.location = this.getAttribute('data-link-to');
            }
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
        $('.loading', elem).remove();
    }

    return {
        init: init
    };

});
