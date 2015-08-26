define([
    'bonzo',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/modules/component',
    'common/modules/sport/score-board'
], function (
    bonzo,
    $,
    ajax,
    config,
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
                responseDataKey: 'liveScore',
                endpoint: config.page.rugbyMatch + '.json'});

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
