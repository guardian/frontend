define(['common', 'reqwest'], function(common, reqwest){ 

    function Related(attachTo) {
        
        // View 
        
        this.view = {
        
            attachTo: attachTo,

            render: function(html) {
                attachTo.innerHTML = html;
            }
        
        }

        // Bindings
        
        common.pubsub.on('modules:related:loaded', this.view.render);
        common.pubsub.on('modules:related:error', this.view.logError);
        
        // Model
        
        this.load = function(url){
            return reqwest({
                    url: url,
                    type: 'jsonp',
                    jsonpCallback: 'foo',
                    jsonpCallbackName: 'foo',
                    success: function(json) {
                        common.pubsub.emit('modules:related:loaded', [json.html])
                    }
            })
        }  

    }
    
    return Related;

});

/*
var doRelated = function () {
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
*/
