// @flow

import $ from 'lib/$';
import { Component } from 'common/modules/component';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import { isBreakpoint } from 'lib/detect';
import { TableDoughnut } from 'common/modules/charts/table-doughnut';
import { belowArticleVisible } from 'lib/page';
import { ScoreBoard } from 'common/modules/sport/score-board';
import { addComponent as addRhcComponent } from 'common/modules/ui/rhc';
import template from 'lodash/utilities/template';

declare type Extra = {
    name: string,
    importance: number,
    content: HTMLElement,
    ready: boolean,
};

const renderExtras = (extras: Array<Extra>): void => {
    if (extras.filter(extra => extra && extra.ready === false).length === 0) {
        belowArticleVisible(
            () => {
                $('.js-after-article').append(
                    $.create(
                        '<div class="football-extras"></div>'
                    ).each(extrasContainer => {
                        extras.forEach(extra => {
                            extrasContainer.appendChild(extra.content);
                        });
                    })
                );
            },
            () => {
                extras.forEach(extra => {
                    addRhcComponent(extra.content, extra.importance);
                });
            }
        );
    }
};

const cricket = (): void => {
    const matchDate = config.get('page.cricketMatchDate');
    const team = config.get('page.cricketTeam');

    if (matchDate && team) {
        const cricketScore = new Component();
        cricketScore.endpoint = `/sport/cricket/match/${matchDate}/${team}.json`;

        fastdom
            .read(() => document.querySelector('.js-cricket-score'))
            .then(parentEl => {
                cricketScore.fetch(parentEl, 'summary');
            });
    }
};

const rugby = (): void => {
    let pageType = '';

    if (config.get('page.isLiveBlog')) {
        pageType = 'minbymin';
    } else if (config.hasTone('Match reports')) {
        pageType = 'report';
    }

    if (config.get('page.rugbyMatch') && pageType) {
        const page = encodeURIComponent(config.get('page.pageId'));

        const scoreBoard = new ScoreBoard({
            pageType,
            parent: $('.js-score'),
            autoupdated: config.get('page.isLive'),
            responseDataKey: 'matchSummary',
            endpoint: `${config.get('page.rugbyMatch')}.json?page=${page}`,
        });

        // Rugby score returns the match nav too, to optimise calls.
        scoreBoard.fetched = (resp: Object): void => {
            fastdom
                .read(() => document.querySelector('.content--liveblog'))
                .then(liveblog => {
                    liveblog.classList.add('content--liveblog--rugby');
                });

            $.create(resp.nav)
                .first()
                .each(nav => {
                    // There ought to be exactly two tabs; match report and min-by-min
                    if ($('.tabs__tab', nav).length === 2) {
                        $('.js-sport-tabs').empty();
                        $('.js-sport-tabs').append(nav);
                    }
                });

            const contentString = resp.scoreEvents;

            if (isBreakpoint({ max: 'mobile' })) {
                const $scoreEventsMobile = $.create(
                    template(resp.dropdown)({
                        name: 'Score breakdown',
                        content: contentString,
                    })
                );

                if (config.get('page.isLiveBlog')) {
                    $scoreEventsMobile.addClass('dropdown--key-events');
                }

                $scoreEventsMobile.addClass('dropdown--active');

                $('.js-after-article').append($scoreEventsMobile);
            } else {
                const $scoreEventsTabletUp = $.create(contentString);

                $scoreEventsTabletUp.addClass('hide-on-mobile');

                $('.rugby-stats').remove();
                $('.score-container').after($scoreEventsTabletUp);
            }

            $('.js-match-stats').remove();

            $.create(
                `<div class="match-stats__container js-match-stats">${resp.matchStat}</div>`
            ).each(container => {
                $('.js-chart', container).each(el => {
                    new TableDoughnut().render(el);
                });

                renderExtras([
                    {
                        name: 'Match stats',
                        importance: 3,
                        content: container,
                        ready: true,
                    },
                ]);
            });

            $('.js-football-table').remove();

            $.create(
                `<div class="js-football-table" data-link-name="football-table-embed">${resp.groupTable}</div>`
            ).each(container => {
                renderExtras([
                    {
                        name: 'Table',
                        importance: 3,
                        content: container,
                        ready: true,
                    },
                ]);
            });
        };

        scoreBoard.load();
    }
};

const initSport = (): void => {
    cricket();
    rugby();
};

export { initSport };
