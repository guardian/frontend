define([
    'common/utils/$',
    'common/utils/config',
    'common/modules/component'
], function (
    $,
    config,
    Component
) {
    function init() {
        var cricketScore, parentEl,
            matchIdentifier = config.page.cricketMatch;

        if (matchIdentifier) {
            cricketScore = new Component();
            parentEl = $('.js-cricket-score')[0];

            cricketScore.endpoint = '/sport/cricket/match/' + matchIdentifier + '.json';
            cricketScore.fetch(parentEl, 'summary');
        }
    }

    return {
        init: init
    };
});
