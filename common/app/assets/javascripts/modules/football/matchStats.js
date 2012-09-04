define(['common', 'reqwest', 'bonzo', 'modules/tabs'], function (common, reqwest, bonzo, Tabs) {

    function MatchStats(matchId, footballServer, isLive) {

        // View

        this.view = {

            //initial rendering
            //this only gets done once for the page
            render: function(json) {

                //add the css stylesheet
                var stylesheet = document.createElement("link");
                stylesheet.href = json.cssUrl;
                stylesheet.rel="stylesheet";
                stylesheet.type = "text/css";
                stylesheet.id = "football-css";
                document.head.appendChild(stylesheet);

                //convert the article body so that it can be a pane on a tab
                var bodyPane = document.querySelector('.article-body');
                bonzo(bodyPane).addClass('tabs-pane');
                bodyPane.setAttribute('id', 'match-report');

                //add a pane for the stats
                var statsPane = document.createElement('div');
                bonzo(statsPane).addClass('tabs-pane').addClass('initially-off');
                statsPane.setAttribute('id', 'match-stats');
                bonzo(statsPane).insertBefore(common.$g('#match-report'));

                //container for the two tab panes
                var container = document.createElement('div');
                bonzo(container).addClass('tabs-content');
                bonzo(container).insertBefore(common.$g('#match-stats'));

                //move article body and stats inside the tabs container
                container.appendChild(bodyPane);
                container.appendChild(statsPane);

                //place the tabs on the page
                bonzo(bonzo.create(json.tabs)).insertBefore(container);

                new Tabs().init();

                common.mediator.emit('modules:football:matchStats:render', json);
            },

            //called every time we refresh the scores
            refresh: function(json){
                document.querySelector('[itemprop=headline]').innerHTML = json.score;
                document.getElementById('match-stats').innerHTML = json.stats;
                common.mediator.emit('modules:football:matchStats:refreshed', json);
            }
        };

        // Bindings

        common.mediator.on('modules:football:matchStats:loaded', this.view.render);

        common.mediator.on('modules:football:matchStats:render', this.view.refresh);
        common.mediator.on('modules:football:matchStats:refresh', this.view.refresh);

        // Model

        this.load = function(){

            function loadStats(callback){
                return reqwest({
                    url: footballServer + '/fragments/match/' + matchId,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'showMatchStats',
                    success: callback
                })
            }

            if (isLive){
                setInterval(function(){
                    loadStats(function(json) {
                        common.mediator.emit('modules:football:matchStats:refresh', json)
                    });
                }, 60000);
            }

            return loadStats(function(json) {
                common.mediator.emit('modules:football:matchStats:loaded', json)
            });
        }
    }

    return MatchStats;
});
