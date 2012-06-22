
var mostPopularPlaceholder = document.getElementById("most-popular");

if (mostPopularPlaceholder) {
    require(["reqwest"], function(reqwest){
        reqwest({
            url: guardian.page.coreNavigationUrl + '/most-popular/' + guardian.page.edition + '/' + guardian.page.section,
            type: 'jsonp',
            jsonpCallback: 'callback',
            jsonpCallbackName: 'showMostPopular',
            success: function(json) {
                if (json.html) {
                    mostPopularPlaceholder.innerHTML = json.html;
                }
            }
        })
    });
}
