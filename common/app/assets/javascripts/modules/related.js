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
        
        // Model
        this.load = function(url){
            return reqwest({
                url: url,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showRelated',
                success: function(json) {
                    common.pubsub.emit('modules:related:loaded', [json.html])
                }
            });
        }  

    }
    
    return Related;

});