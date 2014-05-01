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
    'common/modules/sport/football/match-list-live',
    'common/modules/sport/football/match-info',
    'common/modules/sport/football/score-board',
    'common/modules/sport/football/football'
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
    MatchListLive,
    MatchInfo,
    ScoreBoard,
    football
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
        }, function() {
            $('.score__container', context).remove();
            $('.js-score', context).removeClass('u-h');
        });
    }

    function renderExtras(extras, dropdownTemplate) {
        // clean
        extras = extras.filter(function(extra) { return extra; });
        var ready = extras.filter(function(extra) {
            return extra.ready === false;
        }).length === 0;

        if (ready) {
            page.belowArticleVisible(function() {
                var b;
                $('.js-after-article', context).append(
                    $.create('<div class="football-extras"></div>').each(function(extrasContainer) {
                        extras.forEach(function(extra, i) {
                            if (dropdownTemplate) {
                                $.create(dropdownTemplate).each(function (dropdown) {
                                    if(config.page.isLiveBlog) { $(dropdown).addClass('dropdown--live'); }
                                    $('.dropdown__label', dropdown).append(extra.name);
                                    $('.dropdown__content', dropdown).append(extra.content);
                                    $('.dropdown__button', dropdown)
                                        .attr('data-link-name', 'Show dropdown: '+ extra.name)
                                        .each(function(el) {
                                            if (i === 0) { b = el; }
                                        });
                                }).appendTo(extrasContainer);
                            } else {
                                extrasContainer.appendChild(extra.content);
                            }
                        });
                    })
                );

                // unfortunately this is here as the buttons event is delegated
                // so it needs to be in the dom
                if (b) { bean.fire(b, 'click'); }
            }, function() {
                extras.forEach(function(extra) {
                    rhc.addComponent(extra.content, extra.importance);
                });
            });
        }
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

    function init() {
        // We're doing this as to have one redraw
        var extras = [],
            dropdownTemplate;

        page.isMatch(function(match) {
            extras[0] = { ready: false };
            extras[1] = { ready: false };
            if (match.pageType === 'stats') {
                renderNav(match);
            } else {
                var $h = $('.js-score', context),
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
                    dropdownTemplate = resp.dropdown;
                    scoreContainer.innerHTML = '';
                    scoreBoard.template = match.pageType === 'report' ? resp.scoreSummary : resp.matchSummary;

                    // only show scores on liveblogs or started matches
                    if(!/^\s+$/.test(scoreBoard.template)) {
                        scoreBoard.render(scoreContainer);

                        if (match.pageType === 'report') {
                            $('.tab--min-by-min a', $nav).first().each(function(el) {
                                bonzo(scoreBoard.elem).addClass('u-fauxlink');
                                bean.on(scoreBoard.elem, 'click', function() {
                                    window.location = el.getAttribute('href');
                                });
                            });
                        }
                    } else {
                        $h.removeClass('u-h');
                    }

                    // match stats
                    if (resp.hasStarted) {
                        var statsUrl = $('.tab--stats a', $nav).attr('href').replace(/^.*\/\/[^\/]+/, '');

                        $.create('<div class="match-stats__container"></div>').each(function(container) {
                            football.statsFor(statsUrl).fetch(container).then(function() {
                                $('.js-chart', container).each(function(el) {
                                    new Doughnut().render(el);
                                });
                                extras[0] = {
                                    name: 'Match stats',
                                    importance: 3,
                                    content: container,
                                    ready: true
                                };
                                renderExtras(extras, dropdownTemplate);
                            });
                        });
                    } else {
                        delete extras[0];
                        renderExtras(extras, dropdownTemplate);
                    }

                    // match day
                    page.isCompetition(function(competition) {
                        $.create('<div class="js-football-match-day" data-link-name="football-match-day-embed"></div>').each(function (container) {
                            football.matchDayFor(competition, resp.matchDate).fetch(container).then(function() {
                                extras[1] = {
                                    name: 'Today\'s matches',
                                    importance: 2,
                                    content: container,
                                    ready: true
                                };
                                renderExtras(extras, dropdownTemplate);
                            }, function() {
                                delete extras[1];
                                renderExtras(extras, dropdownTemplate);
                            });
                        });
                    });
                });
            }
        });

        page.isCompetition(function(competition) {
            extras[2] = { ready: false };

            $.create('<div class="js-football-table" data-link-name="football-table-embed"></div>').each(function(container) {
                football.tableFor(competition).fetch(container).then(function() {
                    extras[2] = $('.table__container', container).length > 0 ? {
                        name: 'Table',
                        importance: 3,
                        content: container,
                        ready: true
                    } : undefined;
                    renderExtras(extras, dropdownTemplate);
                }, function() {
                    delete extras[2];
                    renderExtras(extras, dropdownTemplate);
                });
            });
        });

        page.isLiveClockwatch(function() {
            var ml = new MatchListLive('match-day', page.isCompetition() || 'premierleague', config.dateFromSlug()),
                $img = $('.media-primary'),
                $matchListContainer = $.create('<div class="football-matches__container" data-link-name="football-matches-clockwatch"></div>')
                                          .css({ minHeight: $img[0] ? $img[0].offsetHeight : 0 });

            $img.addClass('u-h');
            loading($matchListContainer[0], 'Fetching today\'s matches…', { text: 'Impatient?', href: '/football/live' });

            $('.js-football-meta').append($matchListContainer);
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

                    var nurl = resp[el.getAttribute('data-new-url')];
                    if (nurl) {
                        bonzo(el).attr('href', nurl);
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

    return {
        init: init
    };

});
