define([
    'bonzo',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/component',
    'common/modules/sport/score-board'
], function (
    bonzo,
    $,
    ajax,
    config,
    detect,
    Component,
    ScoreBoard
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

        if (config.page.rugbyMatch) {

            var $h = $('.js-score');

            var scoreBoard = new ScoreBoard({
                pageType: 'report',
                parent: $h,
                autoupdated: false,
                responseDataKey: 'matchSummary',
                endpoint: config.page.rugbyMatch + '.json?page=' + encodeURIComponent(config.page.pageId)});

            // Rugby score returns the match nav too, to optimise calls.
            scoreBoard.fetched = function (resp) {
                $.create(resp.nav).first().each(function (nav) {
                    // There ought to be exactly two tabs; match report and min-by-min
                    if ($('.tabs__tab', nav).length === 2) {
                        $('.js-football-tabs').append(nav);
                    }
                });
            };

            scoreBoard.load();
        }
    }

    function init()  {
        cricket();
    }

    return {
        init: init,
        rugby: rugby
    };
});
