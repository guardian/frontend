var doMostPopular = function () {
    var popularPlaceholder = document.getElementById("most-popular");
    if(popularPlaceholder){
        require(["reqwest"], function(reqwest){
            reqwest({
                url: guardian.page.coreNavigationUrl + '/most-popular/' + guardian.page.edition + '/' + guardian.page.section,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showMostPopular',
                success: function(json) {
                    if (json.html) {
                        popularPlaceholder.innerHTML = json.html;
                    }
                }
            })
        });
    }
}

require([guardian.js.modules["$g"]], function($g){
    $g.onReady(doMostPopular);
});

