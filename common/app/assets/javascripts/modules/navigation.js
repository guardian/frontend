define(['common', 'reqwest'], function(common, reqwest){ 

    function Navigation() {
        
        // View 
        
        this.view = {
        
            render: function(html) {

                //TODO something more useful
                console.log(html);

                common.mediator.emit('modules:navigation:render')
            }
        
        }

        // Bindings
        
        common.mediator.on('modules:navigation:loaded', this.view.render);
        
        // Model
        
        this.load = function(url){
            return reqwest({
                    url: url,
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
