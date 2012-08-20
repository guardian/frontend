define(['common', 'reqwest'], function(common, reqwest){

    function FootballStats(matchId) {

        // View

        this.view = {
            render: function(html) {
                document.querySelector('[itemprop=headline]').innerHTML = html[0];
                document.querySelector('[itemprop=description]').innerHTML = html[1];
                common.mediator.emit('modules:football:render')
            }

        }

        // Bindings

        common.mediator.on('modules:football:loaded', this.view.render);

        // Model

        reqwest({
            //TODO config location of sport server
            url: 'http://localhost:9002/fragments/match/' + matchId,
            type: 'jsonp',
            jsonpCallback: 'callback',
            jsonpCallbackName: 'showFootballData',
            success: function(json) {
                common.mediator.emit('modules:football:loaded', [json.score, json.goals])
            }
        })
    }

    return {
        init: FootballStats
    }

});
