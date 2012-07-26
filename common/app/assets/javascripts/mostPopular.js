var doMostPopular = function () {
    var popularPlaceholder = document.getElementById("most-popular");
    if(popularPlaceholder){
        require(["reqwest", guardian.js.modules.expanderBinder, guardian.js.modules["$g"]], function(reqwest, expanderBinder, $g){
            reqwest({
                url: guardian.page.coreNavigationUrl + '/most-popular/' + guardian.page.edition + '/' + guardian.page.section,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showMostPopular',
                success: function(json) {
                    if (json.html) {
                        popularPlaceholder.innerHTML = json.html;
                        expanderBinder.init($g.qsa('.expander', popularPlaceholder));
                    }
                }
            })
        });
    }
}

require([guardian.js.modules["$g"]], function($g){
    $g.onReady(doMostPopular);
});

