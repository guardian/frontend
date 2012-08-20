define(['common', 'reqwest', 'vendor/bean-0.4.11-1'], function(common, reqwest, bean){

    function FootballStats(matchId) {

        // View
        this.view = {
            render: function(html) {

                //add the stylesheet to the page if it is not already there
                //no need to add it every time we refresh
                if (!document.getElementById("football-css")) {
                    addFootballStylesheet(html[0]);
                }

                document.querySelector('[itemprop=headline]').innerHTML = html[1];

                //document.querySelector('[itemprop=description]').innerHTML = html[2];

                var matchStats = document.createElement("div");

                matchStats.innerHTML = html[2];
                matchStats.className = "football-nav";

                var articleBody = document.querySelector('[itemprop=articleBody]');

                document.querySelector("article").insertBefore(matchStats, articleBody);

                bean.add(document.getElementById('football-tab-matchreport'), 'click', function(e){
                    common.mediator.emit('modules:football:matchReportClicked');
                });

                bean.add(document.getElementById('football-tab-stats'), 'click', function(e){
                    common.mediator.emit('modules:football:statsClicked');
                });

                common.mediator.emit('modules:football:render')
            },
            statsClicked: function(){
                document.querySelector('.article-body').style.display = "none";
                document.getElementById('football-stats').style.display = "block";
            },
            matchReportClicked: function(){
                document.getElementById('football-stats').style.display = "none";
                document.querySelector('.article-body').style.display = "block";
            }
        }

        function addFootballStylesheet(url) {
            var stylesheet = document.createElement("link");
            stylesheet.href = url;
            stylesheet.rel="stylesheet";
            stylesheet.type = "text/css";
            stylesheet.id = "football-css";
            document.head.appendChild(stylesheet);
        }

        // Bindings

        common.mediator.on('modules:football:loaded', this.view.render);

        common.mediator.on('modules:football:statsClicked', this.view.statsClicked);

        common.mediator.on('modules:football:matchReportClicked', this.view.matchReportClicked);

        // Model

        reqwest({
            //TODO config location of sport server
            url: 'http://localhost:9002/fragments/match/' + matchId,
            type: 'jsonp',
            jsonpCallback: 'callback',
            jsonpCallbackName: 'showFootballData',
            success: function(json) {
                common.mediator.emit('modules:football:loaded', [json.cssUrl, json.score, json.stats])
            }
        })
    }

    return {
        init: FootballStats
    }

});
