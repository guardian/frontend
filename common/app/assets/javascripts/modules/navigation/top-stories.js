define(['common', 'reqwest'], function(common, reqwest){ 

    function Navigation() {
        
        // View 
        
        this.view = {
        
            render: function(html) {
                var topstoriesheader = document.getElementById('topstories-header');
                topstoriesheader.innerHTML = html;
                var topstoriesfooter = document.getElementById('topstories-footer');
                topstoriesfooter.innerHTML = html;
                common.mediator.emit('modules:navigation:render')
            }
        
        }

        // Bindings
        
        common.mediator.on('modules:navigation:loaded', this.view.render);
        
        // Model
        
        this.load = function(config){
            var latestUrl = config.page.coreNavigationUrl + '/top-stories/' + config.page.edition;
            
            return reqwest({
                    url: latestUrl + "&x=u",
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'navigation',
                    success: function(json) {
                        common.mediator.emit('modules:navigation:loaded', [json.html])
                    }
            })
        }  

    }
    
    return Navigation;

});
