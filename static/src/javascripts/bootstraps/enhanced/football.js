import bean from 'bean';
import bonzo from 'bonzo';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import fetchJson from 'lib/fetch-json';
import mediator from 'lib/mediator';
import page from 'lib/page';
import reportError from 'lib/report-error';
import Doughnut from 'common/modules/charts/table-doughnut';
import football from 'common/modules/sport/football/football';
import MatchInfo from 'common/modules/sport/football/match-info';
import MatchListLive from 'common/modules/sport/football/match-list-live';
import tagPageStats from 'common/modules/sport/football/tag-page-stats';
import ScoreBoard from 'common/modules/sport/score-board';
import rhc from 'common/modules/ui/rhc';
import relativeDates from 'common/modules/ui/relativedates';

function renderNav(match, callback) {
    const matchInfo = new MatchInfo.MatchInfo(match, config.page.pageId);

    return matchInfo.fetch()
        .then(resp => {
            let $nav;
            if (resp.nav && resp.nav.trim().length > 0) {
                $nav = $.create(resp.nav).first().each(nav => {
                    if (match.id || $('.tabs__tab', nav).length > 2) {
                        $('.js-sport-tabs').append(nav);
                    }
                });
            }

            if (callback) {
                callback(resp, $nav, matchInfo.endpoint);
            }
        })
        .catch(() => {
            $('.score-container').remove();
            $('.js-score').removeClass('u-h');
        });
}

function renderExtras(extras, dropdownTemplate) {
    // clean
    extras = extras.filter(extra => extra);
    const ready = extras.filter(extra => extra.ready === false).length === 0;

    if (ready) {
        page.belowArticleVisible(() => {
            let b;
            $('.js-after-article').append(
                $.create('<div class="football-extras"></div>').each(extrasContainer => {
                    extras.forEach((extra, i) => {
                        if (dropdownTemplate) {
                            $.create(dropdownTemplate).each(dropdown => {
                                if (config.page.isLiveBlog) {
                                    $(dropdown).addClass('dropdown--key-events');
                                }
                                $('.dropdown__label', dropdown).append(extra.name);
                                $('.dropdown__content', dropdown).append(extra.content);
                                $('.dropdown__button', dropdown)
                                    .attr('data-link-name', 'Show dropdown: ' + extra.name)
                                    .each(el => {
                                        if (i === 0) {
                                            b = el;
                                        }
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
            if (b) {
                bean.fire(b, 'click');
            }
        }, () => {
            extras.forEach(extra => {
                rhc.addComponent(extra.content, extra.importance);
            });
        });
    }
}

function renderTable(competition, extras, template) {
    extras[2] = {
        ready: false
    };
    $.create('<div class="js-football-table" data-link-name="football-table-embed"></div>').each(container => {
        football.tableFor(competition).fetch(container).then(() => {
            extras[2] = $('.table__container', container).length > 0 ? {
                name: 'Table',
                importance: 3,
                content: container,
                ready: true
            } : undefined;
            renderExtras(extras, template);
        }, () => {
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
    const extras = [];

    let dropdownTemplate;

    page.isMatch(match => {
        extras[0] = {
            ready: false
        };
        if (match.pageType === 'stats') {
            renderNav(match);
        } else {
            const $h = $('.js-score'),
                  scoreBoard = new ScoreBoard.ScoreBoard({
                      pageType: match.pageType,
                      parent: $h,
                      responseDataKey: 'matchSummary',
                      autoupdated: match.isLive
                  });

            renderNav(match, (resp, $nav, endpoint) => {
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
                    const statsUrl = $('.tab--stats a', $nav).attr('href').replace(/^.*\/\/[^/]+/, '');

                    $.create('<div class="match-stats__container js-match-stats"></div>').each(container => {
                        football.statsFor(statsUrl).fetch(container).then(() => {
                            $('.js-chart', container).each(el => {
                                new Doughnut.TableDoughnut().render(el);
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
                page.isCompetition(competition => {
                    extras[1] = {
                        ready: false
                    };
                    // Group table
                    if (resp.group !== '') {
                        renderTable(competition + '/' + resp.group, extras, dropdownTemplate);
                    }

                    // Other games today
                    $.create('<div class="js-football-match-day" data-link-name="football-match-day-embed"></div>').each(container => {
                        football.matchDayFor(competition, resp.matchDate).fetch(container).then(() => {
                            extras[1] = {
                                name: 'Today’s matches',
                                importance: 2,
                                content: container,
                                ready: true
                            };
                            renderExtras(extras, dropdownTemplate);
                        }, () => {
                            delete extras[1];
                            renderExtras(extras, dropdownTemplate);
                        });
                    });
                });
            });
        }
    });

    page.isCompetition(competition => {
        const $rightHandCol = $('.js-secondary-column').dim().height;
        if ($rightHandCol === 0 || $rightHandCol > 1800) {
            renderTable(competition, extras, dropdownTemplate);
        }
    });

    page.isLiveClockwatch(() => {
        const ml = new MatchListLive.MatchListLive('match-day', page.isCompetition() || 'premierleague', config.dateFromSlug()),
              $img = $('.media-primary'),
              $matchListContainer = $.create('<div class="football-matches__container" data-link-name="football-matches-clockwatch"></div>')
              .css({
                  minHeight: $img[0] ? $img[0].offsetHeight : 0
              });

        $img.addClass('u-h');
        loading($matchListContainer[0], 'Fetching today’s matches…', {
            text: 'Impatient?',
            href: '/football/live'
        });

        $('.js-football-meta').append($matchListContainer);
        ml.fetch($matchListContainer[0]).fail(() => {
            ml.destroy();
            $matchListContainer.remove();
            $img.removeClass('u-h');
        }).always(() => {
            if ($('.football-match', $matchListContainer[0]).length === 0) {
                ml.destroy();
                $matchListContainer.remove();
                $img.removeClass('u-h');
            }
            $matchListContainer.css({
                minHeight: 0
            });
            loaded($matchListContainer[0]);
        });
    });

    page.isFootballStatsPage(() => {
        $('.js-chart').each(el => {
            new Doughnut().render(el);
        });
    });

    // Binding
    bean.on(document.body, 'click', '.js-show-more-football-matches', e => {
        e.preventDefault();
        const el = e.currentTarget;
        fetchJson(el.getAttribute('href') + '.json')
            .then(resp => {
                $.create(resp.html).each(html => {
                    const htmlContainer = document.querySelector('[data-show-more-contains="' + el.getAttribute('data-puts-more-into') + '"]');

                    if (htmlContainer) {
                        relativeDates.replaceLocaleTimestamps(html);
                        htmlContainer.appendChild(html);
                    }

                    const nurl = resp[el.getAttribute('data-new-url')];

                    if (nurl) {
                        bonzo(el).attr('href', nurl);
                    } else {
                        bonzo(el).remove();
                    }
                });
            })
            .catch(ex => {
                reportError(ex, {
                    feature: 'football-show-more'
                });
            });
    });

    bean.on(document.body, 'change', $('form.football-leagues')[0], function() {
        window.location = this.value;
    });

    tagPageStats.tagPageStats();
}

export default {
    init
};
