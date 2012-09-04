define(['common', 'reqwest', 'bonzo'], function (common, reqwest, bonzo) {

    function LeagueTable(competitionId, footballServer) {

        // View
        this.view = {

            render: function(html) {

                //insert after the first trail on the page
                var bindAfter = '.media:nth-child(1)';

                var container = document.createElement('div');
                container.innerHTML = html;
                bonzo(container).insertAfter(common.$g(bindAfter));

                common.mediator.emit('modules:football:leagueTable:render')
            }
        };

        // Bindings
        common.mediator.on('modules:football:leagueTable:loaded', this.view.render);

        // Controller
        this.load = function(){
            return reqwest({
               url: footballServer + '/fragments/leaguetable/' + competitionId,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showLeagueTable',
                success: function(json) {
                    common.mediator.emit('modules:football:leagueTable:loaded', [json.table])
                }
            })
        }
    }

    return LeagueTable;
});
