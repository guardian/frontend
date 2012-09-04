define(['common', 'reqwest'], function(common, reqwest){ 

    function Navigation() {
        
        // View 
        
        this.view = {
        
            render: function(html) {
                console.log(html);
                document.getElementById('offcanvas-promotion').innerHTML = html;
                common.mediator.emit('modules:navigation:render')
            }
        
        }

        // Bindings
        
        common.mediator.on('modules:navigation:loaded', this.view.render);
        
        // Model
        
        this.load = function(config){
            var latestUrl = config.page.coreNavigationUrl + '/top-stories/' + config.page.edition;
            
            console.log(latestUrl);
            
            return reqwest({
                    url: latestUrl,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'navigation',
                    success: function(json) {
                        console.log(json);
                        common.mediator.emit('modules:navigation:loaded', [json.html])
                    }
            })
        }  

    }
    
    return Navigation;

});
