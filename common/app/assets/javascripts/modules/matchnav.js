define(['common', 'reqwest', 'modules/pad', 'modules/pageconfig'], function (common, reqwest, Pad, PageConfig) {

    function MatchNav() {
        
        // View
        
        this.view = {
            render: function (json) {

                document.querySelector(".after-header").innerHTML = json[0].nav;
                if (json[0].related) {
                    document.querySelector("#js-related").innerHTML = json[0].related;
                }

                common.mediator.emit('modules:matchnav:render');
            }
        };

        // Bindings
        common.mediator.on('modules:matchnav:loaded', this.view.render);
        
        // Model
        this.urlForMatchPage = function(){
            if (PageConfig.page.footballMatch) {
                return "/football/api/match-nav/" + PageConfig.page.footballMatch.id +
                    "?currentPage=" + encodeURIComponent(PageConfig.page.pageId);
            }
        };

        this.urlForContent = function(){

            var teamIds = PageConfig.referencesOfType('paFootballTeam');
            var isRightTypeOfContent = PageConfig.hasTone("Match reports") ||
                                       PageConfig.hasTone("Minute by minutes") ||
                                       PageConfig.hasSeries("Squad sheets");

            if(PageConfig.page.section === "football" && teamIds.length === 2 && isRightTypeOfContent){

                return "/football/api/match-nav/" +
                    PageConfig.webPublicationDateAsUrlPart() + "/" +
                    teamIds[0] + "/" + teamIds[1] +
                    "?currentPage=" + encodeURIComponent(PageConfig.page.pageId);
            }
        };

        this.load = function () {
            var url = this.urlForMatchPage() || this.urlForContent();
            if (url) {
                reqwest({
                    url: url,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'showMatchNav',
                    success: function (json) {
                        common.mediator.emit('modules:matchnav:loaded', [json]);
                    },
                    error: function () {
                        common.mediator('module:error', 'Failed to load match nav', 'matchnav.js');
                    }
                });
            }
        };
    }
    
    return MatchNav;

});
