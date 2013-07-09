define(['common', 'bonzo', 'ajax'], function (common, bonzo, ajax) {

    function cricket(config, context, url) {

        url = "/sport" + url + ".json"

        var summaryContainer = document.createElement("div");
        summaryContainer.className = "after-headline";
        var summaryInto = bonzo(summaryContainer);

        var miniScorecardContainer = document.createElement("div");
        miniScorecardContainer.className = "after-headline";
        var scorecardInto = bonzo(miniScorecardContainer);

        ajax({
            url: url,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                if (!scorecardInto.hasClass('lazyloaded'))
                {
                    scorecardInto.html(resp.scorecard);
                    scorecardInto.addClass('lazyloaded');
                    bonzo(context.querySelector('.article-headline')).after(miniScorecardContainer);
                    common.mediator.emit('modules:cricketscorecard:loaded', config, context);
                }
                if (!summaryInto.hasClass('lazyloaded'))
                {
                    summaryInto.html(resp.summary);
                    summaryInto.addClass('lazyloaded');
                    bonzo(context.querySelector('.article-headline')).after(summaryContainer);
                    common.mediator.emit('modules:cricketsummary:loaded', config, context);
                }
            },
            function(req) {
                common.mediator.emit('module:error', 'Failed to load cricket: ' + req.statusText, 'modules/cricketsummary.js');
            }
        );
        common.mediator.emit('modules:cricket:loaded', config, context);
    }

    return cricket;
});