var doRelated = function () {
    var relatedPlaceholder = document.getElementById("related");
    if(relatedPlaceholder){
        require(["reqwest", guardian.js.modules.expanderBinder, guardian.js.modules["$g"]], function(reqwest, expanderBinder, $g){
            reqwest({
                url: guardian.page.coreNavigationUrl + '/related/' + guardian.page.edition + '/' + guardian.page.pageId,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showRelated',
                success: function(json) {
                    if (json.html) {
                        relatedPlaceholder.innerHTML = json.html;
                        expanderBinder.init($g.qsa('.expander', relatedPlaceholder));
                    }
                }
            })
        });
    }
}

require([guardian.js.modules["$g"]], function($g){
    $g.onReady(doRelated);
});

