define([
    'common/utils/config',
    'common/utils/$',
    'common/modules/component'
], function (
    config,
    $,
    Component
) {
    function init() {

        var matchIdentifier = config.page.cricketMatch;

        if (matchIdentifier) {
            var cricketScore = new Component(),
                parentEl = $('.js-score')[0];

            cricketScore.endpoint = '/sport/cricket/match/' + matchIdentifier + '.json';
            cricketScore.fetch(parentEl, 'scorecard');
        }
    }

    return {
        init: init
    };
});