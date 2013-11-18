define([
    'common',
    'bonzo',
    'utils/ajax'
], function (
    common,
    bonzo,
    ajax
) {

    function cricketArticle(config, context, options) {

        /*
         Accepts these options:

         url                    - string
         loadSummary            - bool
         loadScorecard          - bool
         summaryElement         - the element which the summary will be placed after
         scorecardElement       - the element which the scorecard will be placed after
         summaryManipulation    - the manipulation type for the summary DOM injection
         scorecardManipulation  - the manipulation type for the scorecard DOM injection
         */

        if (!config.switches.liveCricket) {
            return;
        }

        ajax({
            url: "/sport" + options.url + ".json",
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                if (options.loadScorecard) {
                    var $scorecardInto = bonzo.create('<div>' + resp.scorecard + '</div>');
                    bonzo($scorecardInto).addClass('cricket-scorecard lazyloaded');
                    common.$g(options.scorecardElement)[options.scorecardManipulation]($scorecardInto);

                    common.mediator.emit('modules:cricketscorecard:loaded', config, context);
                }
                if (options.loadSummary) {
                    var $summaryInto = bonzo.create('<div>' + resp.summary + '</div>');
                    bonzo($summaryInto).addClass('cricket-summary lazyloaded');
                    common.$g(options.summaryElement)[options.summaryManipulation]($summaryInto);

                    common.mediator.emit('modules:cricketsummary:loaded', config, context);
                }
            },
            function(req) {
                common.mediator.emit('module:error', 'Failed to load cricket: ' + req.statusText, 'modules/cricketsummary.js');
            }
        );
        common.mediator.emit('modules:cricket:loaded', config, context);
    }

    function cricketTrail(config, context) {

        var cricketElement = context.querySelector('[data-cricket-match]');

        if (!cricketElement) {
            return;
        }

        if (!config.switches.liveCricket) {
            return;
        }

        var firstCricketBlock = bonzo(cricketElement);

        ajax({
            url: "/sport" + cricketElement.getAttribute('data-cricket-match') + '.json',
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                firstCricketBlock.append(bonzo.create(resp.summary));
            },
            function(req) {
                common.mediator.emit('module:error', 'Failed to load cricket: ' + req.statusText, 'modules/cricketsummary.js');
            }
        );
        common.mediator.emit('modules:cricket:loaded', config, context);
    }

    return {
        cricketArticle: cricketArticle,
        cricketTrail: cricketTrail
    };
});
