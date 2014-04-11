define([
    'common/$',
    'bonzo',
    'bean',
    'common/utils/ajax',
    'common/utils/context',
    'common/utils/config',
    'common/utils/page',
    'common/modules/ui/rhc',
    'common/modules/charts/table-doughnut',
    'common/modules/sport/football/match-list',
    'common/modules/sport/football/match-info',
    'common/modules/sport/football/match-stats',
    'common/modules/sport/football/score-board',
    'common/modules/sport/football/table'
], function (
    $,
    bonzo,
    bean,
    ajax,
    context,
    config,
    page,
    rhc,
    Doughnut,
    MatchList,
    MatchInfo,
    MatchStats,
    ScoreBoard,
    Table
) {
    context = context();

    function renderNav(match, callback) {
        return (new MatchInfo(match, config.page.pageId)).fetch().then(function(resp) {
            var $nav = $.create(resp.nav).first().each(function(nav) {
                if (match.id || $('.tabs__tab', nav).length > 2) {
                    $('.after-header', context).append(nav);
                }
            });

            if (callback) {
                callback(resp, $nav);
            } // The promise chain is broken as Reqwest doesn't allow for creating more than 1 argument.
        });
    }

    function init() {
        page.isMatch(function(match) {
            if (match.pageType === 'stats') {
                renderNav(match);
            } else {
                var $h = $('.article__headline', context),
                    scoreBoard = new ScoreBoard(),
                    scoreContainer = bonzo.create(
                        '<div class="score__container">'+
                            '<div class="score__loading'+ (match.pageType !== 'report' ? ' score__loading--live':'') +'">'+
                                '<div class="loading__text">Fetching the scores…</div>'+
                                '<div class="is-updating"></div>'+
                            '</div>'+
                        '</div>'
                    )[0];

                $h.before(scoreContainer);
                if (match.pageType !== 'report') {
                    $h.addClass('u-h');
                }

                renderNav(match, function(resp, $nav) {
                    if (match.pageType !== 'stats') {
                        scoreContainer.innerHTML = '';
                        scoreBoard.template = match.pageType === 'report' ? resp.scoreSummary : resp.matchSummary;

                        // only show scores on liveblogs or started matches
                        if(!/^\s+$/.test(scoreBoard.template) && (config.page.isLiveBlog || resp.hasStarted)) {
                            scoreBoard.render(scoreContainer);

                            if (match.pageType === 'report') {
                                $('.tab--min-by-min a', $nav).first().each(function(el) {
                                    bonzo(scoreBoard.elem).addClass('u-fauxlink');
                                    bean.on(scoreBoard.elem, 'click', function() {
                                        window.location = el.getAttribute('href');
                                    });
                                });
                            }
                        }

                        if (resp.hasStarted) {
                            var statsUrl = $('.tab--stats a', $nav).attr('href').replace(/^.*\/\/[^\/]+/, ''),
                                statsContainer = bonzo.create('<div class="match-stats__container"></div>'),
                                matchStats = new MatchStats(statsUrl);

                            page.rightHandComponentVisible(function() {
                                rhc.addComponent(statsContainer, 3);
                            }, function() {
                                $('.article-body', context).after(statsContainer);
                            });
                            matchStats.fetch(statsContainer).then(function() {
                                $('.js-chart', statsContainer).each(function(el) {
                                    new Doughnut().render(el);
                                });
                            });
                        }
                    }
                });
            }
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

        bean.on(context, 'click', '.js-show-more', function(e) {
            e.preventDefault();
            var el = e.currentTarget;
            ajax({
                url: el.getAttribute('href') +'.json'
            }).then(function(resp) {
                $.create(resp.html).each(function(html) {
                    $('[data-show-more-contains="'+ el.getAttribute('data-puts-more-into') +'"]', context)
                        .append($(el.getAttribute('data-shows-more'), html));

                    if (resp[el.getAttribute('data-new-url')]) {
                        bonzo(el).attr('href', resp[el.getAttribute('data-new-url')]);
                    } else {
                        bonzo(el).remove();
                    }
                });
            });
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
