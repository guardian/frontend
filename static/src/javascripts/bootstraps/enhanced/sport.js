define([
    'bonzo',
    'bean',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/page',
    'common/modules/charts/table-doughnut',
    'common/modules/component',
    'common/modules/sport/score-board',
    'common/modules/ui/rhc',
    'lodash/utilities/template'
], function (
    bonzo,
    bean,
    $,
    ajax,
    config,
    detect,
    page,
    Doughnut,
    Component,
    ScoreBoard,
    rhc,
    template
) {
    function cricket() {
        var cricketScore, parentEl,
            matchDate = config.page.cricketMatchDate,
            team = config.page.cricketTeam;

        if (matchDate && team) {
            cricketScore = new Component();
            parentEl = $('.js-cricket-score')[0];

            cricketScore.endpoint = '/sport/cricket/match/' + matchDate + '/' + team + '.json';
            cricketScore.fetch(parentEl, 'summary');
        }
    }

    function rugby() {

        var pageType = '';

        if (config.page.isLiveBlog) {
            pageType = 'minbymin';
        } else if (config.hasTone('Match reports')) {
            pageType = 'report';
        }

        if (config.page.rugbyMatch && pageType) {

            var $h = $('.js-score');

            var scoreBoard = new ScoreBoard({
                pageType: pageType,
                parent: $h,
                autoupdated: config.page.isLive,
                responseDataKey: 'matchSummary',
                endpoint: config.page.rugbyMatch + '.json?page=' + encodeURIComponent(config.page.pageId)});

            // Rugby score returns the match nav too, to optimise calls.
            scoreBoard.fetched = function (resp) {
                $('.content--liveblog').addClass('content--liveblog--rugby');

                $.create(resp.nav).first().each(function (nav) {
                    // There ought to be exactly two tabs; match report and min-by-min
                    if ($('.tabs__tab', nav).length === 2) {
                        $('.js-sport-tabs').empty();
                        $('.js-sport-tabs').append(nav);
                    }
                });

                var contentString = resp.scoreEvents;
                if (detect.isBreakpoint({ max: 'mobile' })) {
                    var $scoreEventsMobile = $.create(template(resp.dropdown)({ name: 'Score breakdown', content: contentString }));
                    if (config.page.isLiveBlog) { $scoreEventsMobile.addClass('dropdown--key-events'); }
                    $scoreEventsMobile.addClass('dropdown--active');
                    $('.js-after-article').append($scoreEventsMobile);
                } else {
                    var $scoreEventsTabletUp = $.create(contentString);
                    $scoreEventsTabletUp.addClass('hide-on-mobile');

                    $('.rugby-stats').remove();

                    $('.score-container').after($scoreEventsTabletUp);
                }

                $('.match-stats__container').remove();
                $.create('<div class="match-stats__container">' + resp.matchStat + '</div>').each(function (container) {
                    $('.js-chart', container).each(function (el) {
                        new Doughnut().render(el);
                    });
                    var extras = [];
                    extras[0] = {
                        name: 'Match stats',
                        importance: 3,
                        content: container,
                        ready: true
                    };
                    renderExtras(extras);
                });

                $('.js-football-table').remove();
                $.create('<div class="js-football-table" data-link-name="football-table-embed">' + resp.groupTable + '</div>').each(function (container) {
                    var extras = [];
                    extras[0] = {
                        name: 'Table',
                        importance: 3,
                        content: container,
                        ready: true
                    };
                    renderExtras(extras);
                });

            };

            scoreBoard.load();
        }
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

    function init()  {
        cricket();
        rugby();
    }

    return {
        init: init
    };
});
