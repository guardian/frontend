define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/modules/component'
], function (
    $,
    ajax,
    config,
    Component
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

            //var $h = $('.js-score');

            ajax({
                url: config.page.rugbyMatch + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function (response) {
                    response.liveScore; /// bonzo
                }
            );

                /*scoreContainer = bonzo.create(
                    '<div class="score-container">' +
                    '</div>'
                )[0];

            $h.after(scoreContainer);*/

        }
    }

    function init()  {

        rugby();
        cricket();
    }

    return {
        init: init
    };
});
