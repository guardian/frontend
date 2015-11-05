define([
    'bean',
    'bonzo',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/page',
    'common/modules/charts/table-doughnut',
    'common/modules/sport/football/football',
    'common/modules/sport/football/match-info',
    'common/modules/sport/football/match-list-live',
    'common/modules/sport/football/tag-page-stats',
    'common/modules/sport/score-board',
    'common/modules/ui/rhc',
    'lodash/functions/debounce'
], function (
    bean,
    bonzo,
    _,
    $,
    ajax,
    config,
    detect,
    mediator,
    page,
    Doughnut,
    football,
    MatchInfo,
    MatchListLive,
    tagPageStats,
    ScoreBoard,
    rhc,
    debounce) {

    function renderNav(match, callback) {
        var matchInfo = new MatchInfo(match, config.page.pageId);

        return matchInfo.fetch().then(function (resp) {
            var $nav;
            if (resp.nav && resp.nav.trim().length > 0) {
                $nav = $.create(resp.nav).first().each(function (nav) {
                    if (match.id || $('.tabs__tab', nav).length > 2) {
                        $('.js-sport-tabs').append(nav);
                    }
                });
            }

            if (callback) {
                callback(resp, $nav, matchInfo.endpoint);
            } // The promise chain is broken as Reqwest doesn't allow for creating more than 1 argument.
        }, function () {
            $('.score-container').remove();
            $('.js-score').removeClass('u-h');
        });
    }

    function renderExtras(extras, dropdownTemplate) {
        // clean
        extras = extras.filter(function (extra) {
            return extra;
        });
        var ready = extras.filter(function (extra) {
            return extra.ready === false;
        }).length === 0;

        if (ready) {
            page.belowArticleVisible(function () {
                var b;
                $('.js-after-article').append(
                    $.create('<div class="football-extras"></div>').each(function (extrasContainer) {
                        extras.forEach(function (extra, i) {
                            if (dropdownTemplate) {
                                $.create(dropdownTemplate).each(function (dropdown) {
                                    if (config.page.isLiveBlog) { $(dropdown).addClass('dropdown--key-events'); }
                                    $('.dropdown__label', dropdown).append(extra.name);
                                    $('.dropdown__content', dropdown).append(extra.content);
                                    $('.dropdown__button', dropdown)
                                        .attr('data-link-name', 'Show dropdown: ' + extra.name)
                                        .each(function (el) {
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
            }, function () {
                extras.forEach(function (extra) {
                    rhc.addComponent(extra.content, extra.importance);
                });
            });
        }
    }

    function renderTable(competition, extras, template) {
        extras[2] = { ready: false };
        $.create('<div class="js-football-table" data-link-name="football-table-embed"></div>').each(function (container) {
            football.tableFor(competition).fetch(container).then(function () {
                extras[2] = $('.table__container', container).length > 0 ? {
                    name: 'Table',
                    importance: 3,
                    content: container,
                    ready: true
                } : undefined;
                renderExtras(extras, template);
            }, function () {
                delete extras[2];
                renderExtras(extras, template);
            });
        });
    }

    function loading(elem, message, link) {
        bonzo(elem).append(bonzo.create(
            '<div class="loading">' +
                '<div class="loading__message">' + (message || 'Loading…') + '</div>' +
                (link ? '<a href="' + link.href + '" class="loading__link">' + link.text + '</a>' : '') +
                '<div class="loading__animation"></div>' +
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

        page.isMatch(function (match) {
            extras[0] = { ready: false };
            if (match.pageType === 'stats') {
                renderNav(match);
            } else {
                var $h = $('.js-score'),
                    scoreBoard = new ScoreBoard({
                        pageType: match.pageType,
                        parent: $h,
                        responseDataKey: 'matchSummary',
                        autoupdated: match.isLive
                    });

                renderNav(match, function (resp, $nav, endpoint) {
                    dropdownTemplate = resp.dropdown;

                    // Test if template is not composed of just whitspace. A content validation check, apparently.
                    if (!/^\s+$/.test(scoreBoard.template)) {
                        scoreBoard.endpoint = endpoint;
                        scoreBoard.loadFromJson(resp.matchSummary);
                    } else {
                        $h.removeClass('u-h');
                    }

                    // match stats
                    if (resp.hasStarted && $nav) {
                        var statsUrl = $('.tab--stats a', $nav).attr('href').replace(/^.*\/\/[^\/]+/, '');

                        $.create('<div class="match-stats__container"></div>').each(function (container) {
                            football.statsFor(statsUrl).fetch(container).then(function () {
                                $('.js-chart', container).each(function (el) {
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

                    // Group table & Match day
                    page.isCompetition(function (competition) {
                        extras[1] = { ready: false };
                        // Group table
                        if (resp.group !== '') {
                            renderTable(competition + '/' + resp.group, extras, dropdownTemplate);
                        }

                        $.create('<div class="js-football-match-day" data-link-name="football-match-day-embed"></div>').each(function (container) {
                            football.matchDayFor(competition, resp.matchDate).fetch(container).then(function () {
                                extras[1] = {
                                    name: 'Today’s matches',
                                    importance: 2,
                                    content: container,
                                    ready: true
                                };
                                renderExtras(extras, dropdownTemplate);
                            }, function () {
                                delete extras[1];
                                renderExtras(extras, dropdownTemplate);
                            });
                        });
                    });
                });
            }
        });

        page.isCompetition(function (competition) {
            var $rightHandCol = $('.js-secondary-column').dim().height;
            if ($rightHandCol === 0 || $rightHandCol > 1800) {
                renderTable(competition, extras, dropdownTemplate);
            }
        });

        page.isLiveClockwatch(function () {
            var ml = new MatchListLive('match-day', page.isCompetition() || 'premierleague', config.dateFromSlug()),
                $img = $('.media-primary'),
                $matchListContainer = $.create('<div class="football-matches__container" data-link-name="football-matches-clockwatch"></div>')
                                          .css({ minHeight: $img[0] ? $img[0].offsetHeight : 0 });

            $img.addClass('u-h');
            loading($matchListContainer[0], 'Fetching today’s matches…', { text: 'Impatient?', href: '/football/live' });

            $('.js-football-meta').append($matchListContainer);
            ml.fetch($matchListContainer[0]).fail(function () {
                ml.destroy();
                $matchListContainer.remove();
                $img.removeClass('u-h');
            }).always(function () {
                if ($('.football-match', $matchListContainer[0]).length === 0) {
                    ml.destroy();
                    $matchListContainer.remove();
                    $img.removeClass('u-h');
                }
                $matchListContainer.css({ minHeight: 0 });
                loaded($matchListContainer[0]);
            });
        });

        page.isFootballStatsPage(function () {
            $('.js-chart').each(function (el) {
                new Doughnut().render(el);
            });
        });

        // Binding
        bean.on(document.body, 'click', '.js-show-more-football-matches', function (e) {
            e.preventDefault();
            var el = e.currentTarget;
            ajax({
                url: el.getAttribute('href') + '.json'
            }).then(function (resp) {
                $.create(resp.html).each(function (html) {
                    $('[data-show-more-contains="' + el.getAttribute('data-puts-more-into') + '"]')
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

        bean.on(document.body, 'change', $('form.football-leagues')[0], function () {
            window.location = this.value;
        });

        if (!config.page.isFootballWorldCup2014) {
            bean.on(document.body, 'click', '.table tr[data-link-to]', function (e) {
                if (!e.target.getAttribute('href')) {
                    window.location = this.getAttribute('data-link-to');
                }
            });
        }

        // World Cup content
        // config.switches.worldCupWallchartEmbed
        // Remove this content below when you remove the switch as it's specific to World Cup 2014
        if (config.page.isFootballWorldCup2014) {
            $('a').attr('target', '_top');

            (function () {
                var t, h, i, resize;

                // This stops the SecurityError from halting the execution any further.
                try {
                    i = $('.interactive iframe', window.parent.document).get(0);
                } catch (e) {/**/}

                resize = (function r() {
                    if (!t) {
                        // if this isn't timed out, it triggers another resize
                        h = $('#js-context').offset().height + 50;

                        if (i) { i.height = h; }
                        t = setTimeout(function () {
                            clearTimeout(t); t = null;
                        }, 200);
                    }
                    return r;
                })();
                mediator.on('window:resize', debounce(resize, 200));
                bean.on(document, 'click', '.dropdown__button', resize);
            })();
        }

        tagPageStats();
    }

    return {
        init: init
    };
});
