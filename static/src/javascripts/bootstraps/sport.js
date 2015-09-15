define([
    'bonzo',
    'bean',
    'common/utils/$',
    'common/utils/template',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/charts/table-doughnut',
    'common/modules/component',
    'common/modules/sport/score-board',
    'common/modules/ui/rhc'
], function (
    bonzo,
    bean,
    $,
    template,
    ajax,
    config,
    detect,
    Doughnut,
    Component,
    ScoreBoard,
    rhc
) {
    function cricket() {
        var cricketScore, parentEl,
            matchIdentifier = config.page.cricketMatch;

        if (matchIdentifier) {
            cricketScore = new Component();
            parentEl = $('.js-cricket-score')[0];

            cricketScore.endpoint = '/sport/cricket/match/' + matchIdentifier + '.json';
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
                    rhc.addComponent(container, 3);
                });

            };

            scoreBoard.load();
        }
    }

    function init()  {
        cricket();
        if (config.switches.rugbyWorldCup) {
            rugby();
        }
    }

    return {
        init: init
    };
});
