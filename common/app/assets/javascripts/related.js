var doRelated = function () {
    var relatedPlaceholder = document.getElementById("related");
    if(relatedPlaceholder){
        require(["reqwest"], function(reqwest){
            reqwest({
                url: guardian.page.coreNavigationUrl + '/related/' + guardian.page.edition + '/' + guardian.page.pageId,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showRelated',
                success: function(json) {
                    if (json.html) {
                        relatedPlaceholder.innerHTML = json.html;
                    }
                }
            })
        });
    }
}

require([guardian.js.modules["$g"]], function($g){
    $g.onReady(doRelated);
});

