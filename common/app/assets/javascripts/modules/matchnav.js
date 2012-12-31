define(['common', 'reqwest', 'modules/pad'], function (common, reqwest, Pad) {

    function MatchNav(config, appendTo) {
        
        // View
        
        this.view = {

            appendTo: appendTo,

            render: function (html) {
                var location = document.querySelector(appendTo);
                location.innerHTML = html;
                common.mediator.emit('modules:matchnav:render');
            }
        };

        // Bindings
        
        common.mediator.on('modules:matchnav:loaded', this.view.render);
        
        // Model
        this.navForArticle = function(){

            var references = (config.page.references || []).filter(function(reference){
                return reference.paFootballTeam;
            });

            if(config.page.section === "football"
                && references.length == 2
                && (
                (config.page.tones || "").indexOf("Match reports") > -1
                    || (config.page.tones || "").indexOf("Minute by minutes") > -1
                    || (config.page.series || "").indexOf("Squad sheets") > -1
                )
                ){

                var date = new Date(Date.parse(config.page.webPublicationDate));
                var year = date.getFullYear();
                var month = Pad(date.getMonth() + 1, 2);
                var day = Pad(date.getDate(), 2);
                var pageId = config.page.pageId;

                var url = "/football/api/match-nav/" +
                    year + "/" + month + "/" + day + "/" +
                    references[0].paFootballTeam + "/" + references[1].paFootballTeam +
                    "?currentPage=" + encodeURIComponent(pageId);

                this.load(url);
            }
        };
        
        this.load = function (url) {
            reqwest({
                url: url,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showMatchNav',
                success: function (json) {
                    common.mediator.emit('modules:matchnav:loaded', [json.html]);
                },
                error: function () {
                    common.mediator('module:error', 'Failed to load match nav', 'matchnav.js');
                }
            });
        };
    }
    
    return MatchNav;

});
