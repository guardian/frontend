// @flow
import bean from 'bean';
import bonzo from 'bonzo';
import $ from 'lib/$';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import {
    belowArticleVisible,
    isCompetition,
    isMatch,
    isFootballStatsPage,
    isLiveClockwatch,
} from 'lib/page';
import reportError from 'lib/report-error';
import { TableDoughnut } from 'common/modules/charts/table-doughnut';
import {
    statsFor,
    tableFor,
    matchDayFor,
} from 'common/modules/sport/football/football';
import { MatchInfo } from 'common/modules/sport/football/match-info';
import { MatchListLive } from 'common/modules/sport/football/match-list-live';
import { tagPageStats } from 'common/modules/sport/football/tag-page-stats';
import { ScoreBoard } from 'common/modules/sport/score-board';
import { addComponent } from 'common/modules/ui/rhc';
import { replaceLocaleTimestamps } from 'common/modules/ui/relativedates';

declare type Extra = {
    content?: Element,
    importance?: number,
    name?: string,
    ready: boolean,
};

const renderNav = (
    match: Object,
    callback?: (resp: Object, $nav: bonzo, endpoint: string) => void
): Promise<void> => {
    const matchInfo = new MatchInfo(match, config.get('page.pageId'));

    return matchInfo
        .fetch()
        .then((resp: Object): void => {
            let $nav;

            if (resp.nav && resp.nav.trim().length > 0) {
                $nav = $.create(resp.nav)
                    .first()
                    .each(nav => {
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
};

const renderExtras = (
    _extras: Array<?Extra>,
    dropdownTemplate: string
): void => {
    const extras = [..._extras].filter(extra => extra);
    const ready =
        extras.filter(extra => extra && extra.ready === false).length === 0;
    const createDropdown = (
        template: string,
        extra: Extra,
        container: HTMLElement,
        count: number
    ): void => {
        $.create(template)
            .each(dropdown => {
                if (config.get('page.isLiveBlog')) {
                    $(dropdown).addClass('dropdown--key-events');
                }

                if (extra && extra.name) {
                    $('.dropdown__label', dropdown).append(extra.name);
                }

                if (extra && extra.content) {
                    $('.dropdown__content', dropdown).append(extra.content);
                }

                if (extra && extra.name) {
                    $('.dropdown__button', dropdown)
                        .attr(
                            'data-link-name',
                            `Show dropdown: ${extra.name || ''}`
                        )
                        .each(el => {
                            if (count === 0) {
                                bean.fire(el, 'click');
                            }
                        });
                }
            })
            .appendTo(container);
    };

    if (ready) {
        belowArticleVisible(
            () => {
                $('.js-after-article').append(
                    $.create('<div class="football-extras"></div>').each(
                        extrasContainer => {
                            extras.filter(Boolean).forEach((extra, i) => {
                                if (dropdownTemplate) {
                                    createDropdown(
                                        dropdownTemplate,
                                        extra,
                                        extrasContainer,
                                        i
                                    );
                                } else if (extra.content) {
                                    extrasContainer.appendChild(extra.content);
                                }
                            });
                        }
                    )
                );
            },
            () => {
                extras.filter(Boolean).forEach(extra => {
                    if (extra.content && extra.importance) {
                        addComponent(extra.content, extra.importance);
                    }
                });
            }
        );
    }
};

const renderTable = (
    competition: string,
    extras: Array<?Extra>,
    template: string
): void => {
    extras[2] = {
        ready: false,
    };

    $.create(
        `<div class="js-football-table"
              data-link-name="football-table-embed"></div>
        `
    ).each(container => {
        tableFor(competition)
            .fetch(container)
            .then(() => {
                if ($('.table__container', container).length > 0) {
                    extras[2] = {
                        name: 'Table',
                        importance: 3,
                        content: container,
                        ready: true,
                    };
                } else {
                    extras[2] = undefined;
                }

                renderExtras(extras, template);
            })
            .catch(() => {
                delete extras[2];
                renderExtras(extras, template);
            });
    });
};

const loading = (
    elem: HTMLElement,
    message: string = 'Loading…',
    link: {
        text: string,
        href: string,
    }
): void => {
    bonzo(elem).append(
        bonzo.create(`
            <div class="loading">
                <div class="loading__message">${message}</div>
                    <a href="${link.href}"
                       class="loading__link">${link.text}</a>
                    <div class="loading__animation"></div>
            </div>
        `)
    );
};

const loaded = (elem: HTMLElement): void => {
    $('.loading', elem).remove();
};

const init = (): void => {
    const extras = [];

    let dropdownTemplate;

    isMatch((match: Object): void => {
        extras[0] = {
            ready: false,
        };
        if (match.pageType === 'stats') {
            renderNav(match);
        } else {
            const $h = $('.js-score');
            const scoreBoard = new ScoreBoard({
                pageType: match.pageType,
                parent: $h,
                responseDataKey: 'matchSummary',
                autoupdated: match.isLive,
            });

            renderNav(match, (resp, $nav, endpoint): void => {
                dropdownTemplate = resp.dropdown;

                // Test if template is not composed of just whitspace. A content validation check, apparently.
                if (!/^\s+$/.test(scoreBoard.template || '')) {
                    scoreBoard.endpoint = endpoint;
                    scoreBoard.loadFromJson(resp.matchSummary);
                } else {
                    $h.removeClass('u-h');
                }

                // match stats
                if (resp.hasStarted && $nav) {
                    const statsUrl = $('.tab--stats a', $nav)
                        .attr('href')
                        .replace(/^.*\/\/[^/]+/, '');

                    $.create(
                        `
                        <div class="match-stats__container js-match-stats"></div>
                    `
                    ).each(container => {
                        statsFor(statsUrl)
                            .fetch(container)
                            .then(() => {
                                $('.js-chart', container).each(el => {
                                    new TableDoughnut().render(el);
                                });
                                extras[0] = {
                                    name: 'Match stats',
                                    importance: 3,
                                    content: container,
                                    ready: true,
                                };
                                renderExtras(extras, dropdownTemplate);
                            });
                    });
                } else {
                    delete extras[0];
                    renderExtras(extras, dropdownTemplate);
                }

                // Group table & Match day
                isCompetition((competition: string) => {
                    extras[1] = {
                        ready: false,
                    };

                    // Group table
                    if (resp.group !== '') {
                        renderTable(
                            `${competition}/${resp.group}`,
                            extras,
                            dropdownTemplate
                        );
                    }

                    // Other games today
                    $.create(
                        `
                        <div class="js-football-match-day"
                             data-link-name="football-match-day-embed"></div>
                    `
                    ).each(container => {
                        matchDayFor(competition, resp.matchDate)
                            .fetch(container)
                            .then(() => {
                                extras[1] = {
                                    name: 'Today’s matches',
                                    importance: 2,
                                    content: container,
                                    ready: true,
                                };
                                renderExtras(extras, dropdownTemplate);
                            })
                            .catch(() => {
                                delete extras[1];
                                renderExtras(extras, dropdownTemplate);
                            });
                    });
                });
            });
        }
    });

    isCompetition((competition: string) => {
        const $rightHandCol = $('.js-secondary-column').dim().height;
        if ($rightHandCol === 0 || $rightHandCol > 1800) {
            renderTable(competition, extras, dropdownTemplate);
        }
    });

    isFootballStatsPage(() => {
        $('.js-chart').each(el => {
            new TableDoughnut().render(el);
        });
    });

    isLiveClockwatch(() => {
        const ml = new MatchListLive(
            'match-day',
            isCompetition() || 'premierleague',
            config.dateFromSlug()
        );
        const $img = $('.media-primary');
        const $matchListContainer = $.create(
            `
            <div class="football-matches__container"
                  data-link-name="football-matches-clockwatch"></div>
        `
        ).css({ minHeight: $img[0] ? $img[0].offsetHeight : 0 });

        $img.addClass('u-h');

        loading($matchListContainer[0], 'Fetching today’s matches…', {
            text: 'Impatient?',
            href: '/football/live',
        });

        $('.js-football-meta').append($matchListContainer);

        const handleResponse = (success: boolean): void => {
            if (
                !success ||
                $('.football-match', $matchListContainer[0]).length === 0
            ) {
                ml.destroy();
                $matchListContainer.remove();
                $img.removeClass('u-h');
            }

            $matchListContainer.css({ minHeight: 0 });
            loaded($matchListContainer[0]);
        };

        ml
            .fetch($matchListContainer[0])
            .then(() => {
                handleResponse(true);
            })
            .catch(() => {
                handleResponse(false);
            });
    });

    // Binding
    bean.on(
        document.body,
        'click',
        '.js-show-more-football-matches',
        (e: Event): void => {
            e.preventDefault();

            const el = ((e.currentTarget: any): HTMLLinkElement);

            if (el && el.tagName === 'A') {
                const href = el.getAttribute('href');
                const putsMore = el.getAttribute('data-puts-more-into');
                const newData = el.getAttribute('data-new-url');

                if (href && putsMore && newData) {
                    fetchJson(`${href}.json`)
                        .then(resp => {
                            $.create(resp.html).each(html => {
                                const htmlContainer = document.querySelector(
                                    `[data-show-more-contains="${putsMore}"]`
                                );

                                if (htmlContainer) {
                                    replaceLocaleTimestamps(html);
                                    htmlContainer.appendChild(html);
                                }

                                const nurl = resp[newData];

                                if (nurl) {
                                    bonzo(el).attr('href', nurl);
                                } else {
                                    bonzo(el).remove();
                                }
                            });
                        })
                        .catch(ex => {
                            reportError(ex, {
                                feature: 'football-show-more',
                            });
                        });
                }
            }
        }
    );

    bean.on(
        document.body,
        'change',
        $('form.football-leagues')[0],
        function onChange() {
            window.location = this.value;
        }
    );

    tagPageStats();
};

export { init };
